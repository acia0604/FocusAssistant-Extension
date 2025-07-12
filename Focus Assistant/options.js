document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  chrome.storage.sync.get(['sites', 'hours', 'minutes'], function(data) {
    document.getElementById('hours').value = data.hours || 0;
    document.getElementById('minutes').value = data.minutes || 30;
    
    // Show default sites if none exist
    renderSites(data.sites || [
      'youtube.com',
      'netflix.com',
      'facebook.com',
      'twitter.com',
      'instagram.com',
      'reddit.com'
    ]);
  });

  // Add site button
  document.getElementById('addSite').addEventListener('click', function() {
    const input = document.getElementById('siteInput');
    const site = input.value.trim().toLowerCase();
    
    if (site && !site.includes(' ')) {
      chrome.storage.sync.get(['sites'], function(data) {
        const sites = data.sites || [];
        if (!sites.includes(site)) {
          sites.push(site);
          renderSites(sites);
          input.value = '';
        } else {
          alert('Site already in list!');
        }
      });
    } else {
      alert('Enter a valid domain (e.g. "youtube.com")');
    }
  });

  // Save settings
  document.getElementById('save').addEventListener('click', function() {
    const hours = parseInt(document.getElementById('hours').value) || 0;
    const minutes = parseInt(document.getElementById('minutes').value) || 30;
    const sites = Array.from(document.querySelectorAll('.site-item span')).map(el => el.textContent);
    
    chrome.storage.sync.set({ 
      sites,
      hours,
      minutes
    }, function() {
      alert('Settings saved!');
      window.close();
    });
  });

  // Prevent minutes > 59
  document.getElementById('minutes').addEventListener('change', function() {
    if (this.value > 59) {
      alert("Maximum 59 minutes - use hours instead");
      this.value = 59;
    }
  });

  // Render sites list
  function renderSites(sites) {
    const container = document.getElementById('sites-list');
    container.innerHTML = '';
    
    if (sites.length === 0) {
      container.textContent = 'No sites added yet';
      return;
    }
    
    sites.forEach(function(site) {
      const div = document.createElement('div');
      div.className = 'site-item';
      div.innerHTML = `
        <span>${site}</span>
        <button class="remove">Remove</button>
      `;
      
      div.querySelector('.remove').addEventListener('click', function() {
        const newSites = sites.filter(s => s !== site);
        renderSites(newSites);
      });
      
      container.appendChild(div);
    });
  }
});