package edu.eci.arsw.collabpaint;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import edu.eci.arsw.collabpaint.model.Point;
import edu.eci.arsw.collabpaint.model.Polygon;

@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;

    private final ConcurrentMap<String, List<Point>> drawings = new ConcurrentHashMap<>();

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) {
        System.out.println("Nuevo punto recibido en el servidor! Dibujo ID: " + numdibujo + " Punto: " + pt);

        drawings.putIfAbsent(numdibujo, new ArrayList<>());
        List<Point> points = drawings.get(numdibujo);

        synchronized (points) {
            points.add(pt);
            msgt.convertAndSend("/topic/newpoint." + numdibujo, pt);


            if (points.size() >= 4) {
                Polygon polygon = new Polygon(new ArrayList<>(points));
                msgt.convertAndSend("/topic/newpolygon." + numdibujo, polygon);
                points.clear();
            }
        }
    }
}

