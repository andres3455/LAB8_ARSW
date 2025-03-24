package edu.eci.arsw.collabpaint;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import edu.eci.arsw.collabpaint.model.Point;
@Controller
public class Collabcontroller {
    @MessageMapping("/newpoint")
    @SendTo("/topic/newpoint")
    public Point point(Point message) throws Exception {
        System.out.println("📡 Punto recibido: X=" + message.getX() + ", Y=" + message.getY());        
        return new Point(message.getX(), message.getY());
    }
}