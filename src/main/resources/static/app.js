var app = (function () {

    var topico = "/newpoint";

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    var stompClient = null;

    var addPointToTopic = function (point) {
        if (stompClient && stompClient.connected) {
            stompClient.send("/app/newpoint", {}, JSON.stringify(point));
        } else {
            console.error("No hay conexión WebSocket activa.");
            alert("Error: No hay conexión con el servidor WebSocket.");
        }
    };

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.stroke();
    };

    var getMousePosition = function (evt) {
        var canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
    
        stompClient.connect({}, function (frame) {
            console.log('Connected to WebSocket: ' + frame);
    
            var topicPath = "/topic/newpoint";  // 🔥 Suscribirse al tópico correcto
            console.log("Suscribiéndose a:", topicPath);
    
            stompClient.subscribe(topicPath, function (eventbody) {
                console.log("Mensaje recibido en WebSocket:", eventbody.body);
    
                var data = JSON.parse(eventbody.body);
                alert("Nuevo punto recibido: X=" + data.x + ", Y=" + data.y);
                addPointToCanvas(data);
            });
        }, function (error) {
            console.error("Error al conectar con WebSocket:", error);
        });
    };
    

    return {

        connect: function (dibujoid) {
            var can = document.getElementById("canvas");
            var option = document.getElementById("connection");
            topico = option.value + dibujoid;

            // Conectar al WebSocket
            connectAndSubscribe();
            alert("Dibujo No " + dibujoid);

            if (topico.includes("newpoint")) {
                if (window.PointerEvent) {
                    can.addEventListener("pointerdown", function (evt) {
                        var pt = getMousePosition(evt);
                        addPointToCanvas(pt);
                        addPointToTopic(pt);
                    });
                }
            }
        },

        publishPoint: function (px, py) {
            if (!stompClient || !stompClient.connected) {
                alert("Error: No hay conexión con el WebSocket.");
                return;
            }
        
            var pt = new Point(parseInt(px), parseInt(py));
            console.info("Publishing point at:", pt);
            addPointToCanvas(pt);
        
            // 🔥 Enviar al servidor correctamente
            stompClient.send("/app/newpoint", {}, JSON.stringify(pt));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
                console.log("Disconnected");
            }
        }
    };

})();
