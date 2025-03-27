var app = (function () {

    var topico = null;
    var stompClient = null;

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    class Polygon {
        constructor(points) {
            this.points = points;
        }
    }

    var addPointToTopic = function (point) {
        if (stompClient && stompClient.connected) {
            stompClient.send("/app/newpoint", {}, JSON.stringify(point));
        } else {
            console.error("No hay conexión WebSocket activa.");
            alert("Error: No hay conexión con el servidor WebSocket.");
        }
    };

    //parte 2
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

    var drawPolygon = function (polygon) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");

        ctx.beginPath();
        ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
        for (var i = 1; i < polygon.points.length; i++) {
            ctx.lineTo(polygon.points[i].x, polygon.points[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
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

    var connectAndSubscribe = function (dibujoid) {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
    
        stompClient.connect({}, function (frame) {
            console.log('Connected to WebSocket: ' + frame);
    
            topico = `/topic/newpoint.${dibujoid}`; 
            console.log("📡 Suscribiéndose a:", topico);
    
            stompClient.subscribe(topico, function (eventbody) {
                console.log("Mensaje recibido en WebSocket:", eventbody.body);
    
                var data = JSON.parse(eventbody.body);
                alert(`Nuevo punto recibido en dibujo ${dibujoid}: X=${data.x}, Y=${data.y}`);
                addPointToCanvas(data); // parte 2
            });

            stompClient.subscribe(`/topic/newpolygon.${dibujoid}`, function (eventbody) {
                console.log("📐 Polígono recibido:", eventbody.body);
                var polygonData = JSON.parse(eventbody.body);
                drawPolygon(polygonData);
            });
        }, function (error) {
            console.error("Error al conectar con WebSocket:", error);
        });
    };
    


    return {
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
                console.log("🔌 Desconectado del WebSocket");
            }
        }
    };
})();
