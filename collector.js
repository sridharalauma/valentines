// Client-side collector: save choices to localStorage and submit to server
(function(){
  function saveChecked(name){
    const els = document.querySelectorAll('input[name="'+name+'"]:checked');
    return Array.from(els).map(e=>e.value);
  }

  function saveAndGo(key, name, href){
    let val;
    if(name === 'date'){
      const inp = document.querySelector('input[type="date"]');
      val = inp ? inp.value : null;
    } else {
      val = saveChecked(name);
    }
    localStorage.setItem(key, JSON.stringify(val));
    window.location.href = href;
  }

  window.saveFoodAndGo = function(){ saveAndGo('food','food','dessert.html'); };
  window.saveDessertAndGo = function(){ saveAndGo('dessert','dessert','activities.html'); };
  window.saveActivitiesAndGo = function(){ saveAndGo('activities','activities','lastpage.html'); };
  window.saveDateAndGo = function(){ saveAndGo('date','date','food.html'); };

  window.submitResponses = function(){
    const payload = {
      date: JSON.parse(localStorage.getItem('date') || 'null'),
      food: JSON.parse(localStorage.getItem('food') || '[]'),
      dessert: JSON.parse(localStorage.getItem('dessert') || '[]'),
      activities: JSON.parse(localStorage.getItem('activities') || '[]'),
      timestamp: new Date().toISOString()
    };

    const serviceId = 'service_tguytxi';
    const templateId = 'template_d78ajtq';
    const publicKey = 'bXOLm0LkKUPHdXlyZ';

    const body = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        date: payload.date || 'N/A',
        food: (payload.food || []).join(', ') || 'N/A',
        dessert: (payload.dessert || []).join(', ') || 'N/A',
        activities: (payload.activities || []).join(', ') || 'N/A',
        timestamp: payload.timestamp
      }
    };

    fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(r=>{
      if(!r.ok){ throw new Error('Email send failed'); }
      const el = document.createElement('div');
      el.style.position = 'fixed'; el.style.bottom = '20px'; el.style.left = '20px';
      el.style.background = '#fff'; el.style.padding = '8px 12px'; el.style.border = '1px solid #ccc';
      el.style.zIndex = 9999;
      el.textContent = 'Responses emailed!';
      document.body.appendChild(el);
      localStorage.removeItem('date'); localStorage.removeItem('food'); localStorage.removeItem('dessert'); localStorage.removeItem('activities');
    }).catch(e=>{
      const el = document.createElement('div'); el.textContent = 'Submit failed: '+e; el.style.position='fixed'; el.style.bottom='20px'; el.style.left='20px'; el.style.background='#fff'; el.style.padding='8px 12px'; el.style.border='1px solid #f00'; el.style.zIndex=9999; document.body.appendChild(el);
    });
  };

  // Auto-submit when landing on lastpage.html
  try{
    const loc = window.location.href;
    if(loc && (loc.endsWith('lastpage.html') || loc.indexOf('lastpage.html') !== -1)){
      window.addEventListener('load', ()=>{ window.submitResponses(); });
    }
  }catch(e){}
})();
