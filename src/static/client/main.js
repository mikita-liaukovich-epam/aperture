const host = window.location.host;
const luxLevel = document.querySelector('.lux-level');
const connectionStatus = document.querySelector('.connection-status');
const messageEl = document.querySelector('.message');

connectionStatus.innerHTML = `Подключение к ${host} (&#8635;)`;

const connection = new WebSocket(`ws://${host}`);


window.addEventListener('devicelight', (event, error) => {
  if (!error) {
    messageEl.innerHTML = '';
    luxLevel.innerHTML = event.value;
    if (connection) {
      connection.send(event.value);  
    }
  } else {
    console.error(error);
  }
})

connection.onopen = () => {
  connectionStatus.innerHTML = `Подключен к ${host} (&#10004;)`;
  
}

connection.onclose = () => {
  connectionStatus.innerHTML = `Отключено от ${host} (&#10008;)`;
}

connection.onerror = () => {
  connectionStatus.innerHTML = `Ошибка подключения к серверу (&#9785;)`;
}
