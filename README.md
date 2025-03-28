### Escuela Colombiana de Ingeniería
### Arquitecturas de Software - ARSW
### Laboratorio - Broker de Mensajes STOMP con WebSockets + HTML5 Canvas.

### Laboratorio desarrollado por:
* Andrés Felipe Rodríguez Chaparro
* Santiago Guerra

----

- Conectarse con un botón
- publicar con eventos de mouse

var newpoint = JSON.parse(greeting.body);
                addPointToCanvas(newpoint);


stompClient.send("/topic/newpoint", {}, JSON.stringify(pt));  				


Este ejercicio se basa en la documentación oficial de SprinbBoot, para el [manejo de WebSockets con STOMP](https://spring.io/guides/gs/messaging-stomp-websocket/).

En este repositorio se encuentra una aplicación SpringBoot que está configurado como Broker de mensajes, de forma similar a lo mostrado en la siguiente figura:

![](https://docs.spring.io/spring/docs/current/spring-framework-reference/images/message-flow-simple-broker.png)

En este caso, el manejador de mensajes asociado a "/app" aún no está configurado, pero sí lo está el broker '/topic'. Como mensaje, se usarán puntos, pues se espera que esta aplicación permita progragar eventos de dibujo de puntos generados por los diferentes clientes.

## Parte I.

Para las partes I y II, usted va a implementar una herramienta de dibujo colaborativo Web, basada en el siguiente diagrama de actividades:

![](img/P1-AD.png)

Para esto, realice lo siguiente:

1. Haga que la aplicación HTML5/JS al ingresarle en los campos de X y Y, además de graficarlos, los publique en el tópico: /topic/newpoint . Para esto tenga en cuenta (1) usar el cliente STOMP creado en el módulo de JavaScript y (2) enviar la representación textual del objeto JSON (usar JSON.stringify). Por ejemplo:

	```javascript
	//creando un objeto literal
	stompClient.send("/topic/newpoint", {}, JSON.stringify({x:10,y:10}));
	```

	```javascript
	//enviando un objeto creado a partir de una clase
	stompClient.send("/topic/newpoint", {}, JSON.stringify(pt)); 
	```

2. Dentro del módulo JavaScript modifique la función de conexión/suscripción al WebSocket, para que la aplicación se suscriba al tópico "/topic/newpoint" (en lugar del tópico /TOPICOXX). Asocie como 'callback' de este suscriptor una función que muestre en un mensaje de alerta (alert()) el evento recibido. Como se sabe que en el tópico indicado se publicarán sólo puntos, extraiga el contenido enviado con el evento (objeto JavaScript en versión de texto), conviértalo en objeto JSON, y extraiga de éste sus propiedades (coordenadas X y Y). Para extraer el contenido del evento use la propiedad 'body' del mismo, y para convertirlo en objeto, use JSON.parse. Por ejemplo:

	```javascript
	var theObject=JSON.parse(message.body);
	```
3. Compile y ejecute su aplicación. Abra la aplicación en varias pestañas diferentes (para evitar problemas con el caché del navegador, use el modo 'incógnito' en cada prueba).
4. Ingrese los datos, ejecute la acción del botón, y verifique que en todas la pestañas se haya lanzado la alerta con los datos ingresados.

5. Haga commit de lo realizado, para demarcar el avance de la parte 2.

	```bash
	git commit -m "PARTE 1".
	```
## Desarrollo parte 1

En el archivo html, se agregaron los campos para capturar los puntos a enviar 

```html
<html>
<head>
    <title>TODO supply a title</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="/webjars/jquery/jquery.min.js"></script>
    <script src="/webjars/sockjs-client/sockjs.min.js"></script>
    <script src="/webjars/stomp-websocket/stomp.min.js"></script>
    <script src="/app.js"></script>

</head>


<body onload="app.init()">
<div>
    <select class="box" id="connection">
        <option value="/newpoint">Dibujo</option>
    </select>
    <button onclick="app.connect">Connect</button>
</div>
X:<input id="x" type="number"/>
Y:<input id="y" type="number"/>
<button onclick="app.publishPoint($('#x').val(),$('#y').val())">Send point</button>
<canvas id="canvas" width="800" height="600"></canvas>
</body>
</html>
```
Se maneja en el js para que se suscriba al topico

```javascript
var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
    
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
    
            stompClient.subscribe('/topic/newpoint', function (eventbody) {
                console.log("Mensaje recibido en WebSocket:", eventbody.body);
    
                var data = JSON.parse(eventbody.body);
                alert(`Nuevo punto recibido: X=${data.x}, Y=${data.y}`);
                addPointToCanvas(data); // parte 2
            });
        }, function (error) {
            console.error("Error al conectar con WebSocket:", error);
        });
    }
```
![Captura de pantalla 2025-03-24 133611](https://github.com/user-attachments/assets/3f5a70b7-c546-46cf-b0b1-39f4319be910)


![Captura de pantalla 2025-03-24 133640](https://github.com/user-attachments/assets/bd6681c5-254c-4617-88a7-95c3cebbcabf)


## Parte II.

Para hacer mas útil la aplicación, en lugar de capturar las coordenadas con campos de formulario, las va a capturar a través de eventos sobre un elemento de tipo \<canvas>. De la misma manera, en lugar de simplemente mostrar las coordenadas enviadas en los eventos a través de 'alertas', va a dibujar dichos puntos en el mismo canvas. Haga uso del mecanismo de captura de eventos de mouse/táctil usado en ejercicios anteriores con este fin.

1. Haga que el 'callback' asociado al tópico /topic/newpoint en lugar de mostrar una alerta, dibuje un punto en el canvas en las coordenadas enviadas con los eventos recibidos. Para esto puede [dibujar un círculo de radio 1](http://www.w3schools.com/html/html5_canvas.asp).
4. Ejecute su aplicación en varios navegadores (y si puede en varios computadores, accediendo a la aplicación mendiante la IP donde corre el servidor). Compruebe que a medida que se dibuja un punto, el mismo es replicado en todas las instancias abiertas de la aplicación.

5. Haga commit de lo realizado, para marcar el avance de la parte 2.

	```bash
	git commit -m "PARTE 2".
	```

### Desarrollo parte 2

Para este caso debemos capturar y enviar automaticamente los puntos que capturemos directamente en el canvas, en el Js debemos agregar los siguientes bloques de codigo para cumplir con esta funcionalidad

```javascript
var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
    
        console.log(`Dibujando punto en: X=${point.x}, Y=${point.y}`);
    
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.stroke();
    };
    
    //parte 2
    var getMousePosition = function (evt) {
        var canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };
```

y en la función de conexión nos aseguramos de agregar el evento del mouse

```javascript
var canvas = document.getElementById("canvas");
            canvas.addEventListener("click", function (evt) {
                var pt = getMousePosition(evt);
                console.info(` Publicando punto desde canvas en: ${topico}`, pt);
                app.publishPoint(pt.x, pt.y);
            });
```

### Video



https://github.com/user-attachments/assets/ea12126a-70e9-409c-bd68-36e027547229



## Parte III.

Ajuste la aplicación anterior para que pueda manejar más de un dibujo a la vez, manteniendo tópicos independientes. Para esto:

1. Agregue un campo en la vista, en el cual el usuario pueda ingresar un número. El número corresponderá al identificador del dibujo que se creará.
2. Modifique la aplicación para que, en lugar de conectarse y suscribirse automáticamente (en la función init()), lo haga a través de botón 'conectarse'. Éste, al oprimirse debe realizar la conexión y suscribir al cliente a un tópico que tenga un nombre dinámico, asociado el identificador ingresado, por ejemplo: /topic/newpoint.25, topic/newpoint.80, para los dibujos 25 y 80 respectivamente.
3. De la misma manera, haga que las publicaciones se realicen al tópico asociado al identificador ingresado por el usuario.
4. Rectifique que se puedan realizar dos dibujos de forma independiente, cada uno de éstos entre dos o más clientes.

	```bash
	git commit -m "PARTE 3".
	```

Desarrollo parte 3

Para esta parte debemos ajustar el html y el Js 

Al html le hacemos le añadimos el campo para el Id del dibujo

```html

<input id="dibujoid" type="number" placeholder="Ingrese ID de dibujo" />
        <button onclick="app.connect()">Conectarse</button>
        <p>Haz clic en el canvas para agregar puntos o ingrésalos manualmente:</p>
        X: <input id="x" type="number" />
        Y: <input id="y" type="number" />
        <button onclick="app.publishPoint($('#x').val(),$('#y').val())">Send point</button>

<canvas id="canvas" width="1000" height="1000" style="border: 2px solid black;"></canvas>

  </body>

```

```javascript
//parte 3
        connect: function () {
            var dibujoid = document.getElementById("dibujoid").value;
            if (!dibujoid) {
                alert("Debes ingresar un ID para conectarte.");
                return;
            }
            connectAndSubscribe(dibujoid);

            var canvas = document.getElementById("canvas");
            canvas.addEventListener("click", function (evt) {
                var pt = getMousePosition(evt);
                console.info(` Publicando punto desde canvas en: ${topico}`, pt);
                app.publishPoint(pt.x, pt.y);
            });
        },

        publishPoint: function (px, py) {
            if (!stompClient || !stompClient.connected) {
                alert("Error: No hay conexión con el WebSocket.");
                return;
            }

            var pt = new Point(parseInt(px), parseInt(py));
            console.info(" Publicando punto en:", topico);
            addPointToCanvas(pt);
            stompClient.send(`/app/newpoint.${topico.split(".")[1]}`, {}, JSON.stringify(pt)); // Envío dinámico
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
                console.log(" Desconectado del WebSocket");
            }
        }
    };

```
### Video


https://github.com/user-attachments/assets/d6de620b-adae-4e40-a7f9-8db4ca69283d



## Parte IV.

Para la parte IV, usted va  a implementar una versión extendida del modelo de actividades y eventos anterior, en la que el servidor (que hasta ahora sólo fungía como Broker o MOM -Message Oriented Middleware-) se volverá también suscriptor de ciertos eventos, para a partir de los mismos agregar la funcionalidad de 'dibujo colaborativo de polígonos':

![](img/P2-AD.png)

Para esto, se va a hacer una configuración alterna en la que, en lugar de que se propaguen los mensajes 'newpoint.{numdibujo}' entre todos los clientes, éstos sean recibidos y procesados primero por el servidor, de manera que se pueda decidir qué hacer con los mismos. 

Para ver cómo manejar esto desde el manejador de eventos STOMP del servidor, revise [puede revisar la documentación de Spring](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#websocket-stomp-destination-separator).


1. Cree una nueva clase que haga el papel de 'Controlador' para ciertos mensajes STOMP (en este caso, aquellos enviados a través de "/app/newpoint.{numdibujo}"). A este controlador se le inyectará un bean de tipo SimpMessagingTemplate, un Bean de Spring que permitirá publicar eventos en un determinado tópico. Por ahora, se definirá que cuando se intercepten los eventos enviados a "/app/newpoint.{numdibujo}" (que se supone deben incluir un punto), se mostrará por pantalla el punto recibido, y luego se procederá a reenviar el evento al tópico al cual están suscritos los clientes "/topic/newpoint".

	![](img/P4-AD.png)

2. Ajuste su cliente para que, en lugar de publicar los puntos en el tópico /topic/newpoint.{numdibujo}, lo haga en /app/newpoint.{numdibujo}. Ejecute de nuevo la aplicación y rectifique que funcione igual, pero ahora mostrando en el servidor los detalles de los puntos recibidos.
	![](img/P4-AD-JS.png)
3. Una vez rectificado el funcionamiento, se quiere aprovechar este 'interceptor' de eventos para cambiar ligeramente la funcionalidad:

	1. Se va a manejar un nuevo tópico llamado '/topic/newpolygon.{numdibujo}', en donde el lugar de puntos, se recibirán objetos javascript que tengan como propiedad un conjunto de puntos.
   		![](img/P4-AD-3-1.png)
	2. El manejador de eventos de /app/newpoint.{numdibujo}, además de propagar los puntos a través del tópico '/topic/newpoints', llevará el control de los puntos recibidos(que podrán haber sido dibujados por diferentes clientes). Cuando se completen tres o más puntos, publicará el polígono en el tópico '/topic/newpolygon'. Recuerde que esto se realizará concurrentemente, de manera que REVISE LAS POSIBLES CONDICIONES DE CARRERA!. También tenga en cuenta que desde el manejador de eventos del servidor se tendrán N dibujos independientes!.
		![](img/P4-AD-3-2.png)
	3. El cliente, ahora también se suscribirá al tópico '/topic/newpolygon'. El 'callback' asociado a la recepción de eventos en el mismo debe, con los datos recibidos, dibujar un polígono, [tal como se muestran en ese ejemplo](http://www.arungudelli.com/html5/html5-canvas-polygon/).
   		![](img/P4-AD-3-3.png)
	4. Verifique la funcionalidad: igual a la anterior, pero ahora dibujando polígonos cada vez que se agreguen cuatro puntos.
   		![](img/P4-AD-3-4.png)
   		
		![](img/funcionando.png)
	
5. A partir de los diagramas dados en el archivo ASTAH incluido, haga un nuevo diagrama de actividades correspondiente a lo realizado hasta este punto, teniendo en cuenta el detalle de que ahora se tendrán tópicos dinámicos para manejar diferentes dibujos simultáneamente.

5. Haga commit de lo realizado.

	```bash
	git commit -m "PARTE FINAL".
	```	



### Criterios de evaluación

1. La aplicación propaga correctamente los puntos entre todas las instancias abierta de la misma, cuando hay sólo un dibujo.
2. La aplicación propaga correctamente los puntos entre todas las instancias abierta de la misma, cuando hay más de un dibujo.
3. La aplicación propaga correctamente el evento de creación del polígono, cuando colaborativamente se insertan cuatro puntos.
4. La aplicación propaga correctamente el evento de creación del polígono, cuando colaborativamente se insertan cuatro puntos, con 2 o más dibujos simultáneamente.
5. En la implementación se tuvo en cuenta la naturaleza concurrente del ejercicio. Por ejemplo, si se mantiene el conjunto de los puntos recibidos en una colección, la misma debería ser de tipo concurrente (thread-safe).
