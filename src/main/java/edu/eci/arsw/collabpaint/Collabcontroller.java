package edu.eci.arsw.collabpaint;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.stereotype.Controller;

import edu.eci.arsw.collabpaint.model.Point;

@Controller
public class Collabcontroller {

    @MessageMapping("/newpoint.{id}")
    @SendTo("/topic/newpoint.{id}")  
    public Point sendPoint(@DestinationVariable String id, Point point) {
        System.out.println("📡 Enviando punto al tópico /topic/newpoint." + id + ": " + point);
        return point;
    }
}