const host = window.location.host;
const luxLevel = document.querySelector('.lux-level');
const connectionStatus = document.querySelector('.connection-status');
const messageEl = document.querySelector('.message');

connectionStatus.innerHTML = `Подключение к ${host} (&#8635;)`;

const connection = new WebSocket(`wss://${host}`);

if (window.AmbientLightSensor) {
  const sensor = new AmbientLightSensor();
  
  sensor.onreading = () => {
    messageEl.innerHTML = 'lux';
    
    luxLevel.innerHTML = sensor.illuminance;
    
    if (connection) {
      connection.send(sensor.illuminance);  
    }
  };

  sensor.onerror = (event) => {
    console.error(event.error.name, event.error.message);
  };

  sensor.start();
} else {
  window.addEventListener('devicelight', (event, error) => {
    if (!error) {
      messageEl.innerHTML = 'lux';
      luxLevel.innerHTML = event.value;
      if (connection) {
        connection.send(event.value);  
      }
    } else {
      console.error(error);
    }
  })
}

connection.onopen = () => {
  connectionStatus.innerHTML = `Подключен к ${host} (&#10004;)`;
  
}

connection.onclose = () => {
  connectionStatus.innerHTML = `Отключено от ${host} (&#10008;)`;
}

connection.onerror = () => {
  connectionStatus.innerHTML = `Ошибка подключения к серверу (&#9785;)`;
}
