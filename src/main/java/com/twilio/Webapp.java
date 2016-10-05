package com.twilio;

import static spark.Spark.get;
import static spark.Spark.staticFileLocation;

import java.util.HashMap;

import com.github.javafaker.Faker;
import com.google.gson.Gson;
import com.twilio.sdk.client.TwilioCapability;

public class Webapp {
  
  public static void main(String[] args) {
    // Serve static files from src/main/resources/public
    staticFileLocation("/public");
    
    // Create a Faker instance to generate a random username for the connecting user
    Faker faker = new Faker();
    
    // Create a capability token using our Twilio credentials
    get("/token", "application/json", (request, response) -> {
      String acctSid = System.getenv("TWILIO_ACCOUNT_SID");
      String authToken = System.getenv("TWILIO_AUTH_TOKEN");
      String applicationSid = System.getenv("TWILIO_TWIML_APP_SID");
      // Generate a random username for the connecting client
      String identity = faker.firstName() + faker.lastName() + faker.zipCode();
      
      // Generate capability token
      TwilioCapability capability = new TwilioCapability(acctSid, authToken);
      capability.allowClientOutgoing(applicationSid);
      capability.allowClientIncoming(identity);
      String token = capability.generateToken();
        
      // create JSON response payload 
      HashMap<String, String> json = new HashMap<String, String>();
      json.put("identity", identity);
      json.put("token", token);

      // Render JSON response
      response.header("Content-Type", "application/json"); 
      Gson gson = new Gson();
      return gson.toJson(json);
    });
  }
}
