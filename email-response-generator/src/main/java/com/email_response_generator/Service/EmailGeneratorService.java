package com.email_response_generator.Service;

import com.email_response_generator.dto.EmailRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    public String generateEmailReply(EmailRequest emailRequest) {
        // Build prompt
        String prompt = buildPrompt(emailRequest);

        // Create request body
        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", prompt)
                        })
                }
        );

        try {
            // Send request to Gemini API
            String response = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path(geminiApiUrl)
                            .queryParam("key", geminiApiKey)
                            .build())
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return extractResponseContent(response);
        } catch (Exception e) {
            return "API request failed: " + e.getMessage();
        }
    }

    private String extractResponseContent(String response) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(response);

            JsonNode candidates = rootNode.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                return candidates.get(0)
                        .path("content")
                        .path("parts")
                        .get(0)
                        .path("text")
                        .asText();
            } else {
                return "No content found in the response.";
            }
        } catch (Exception e) {
            return "Error processing response: " + e.getMessage();
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate the email reply for the following email content. Please don't generate subject line. ");
        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append("Use a ").append(emailRequest.getTone()).append(" tone. ");
        }
        prompt.append("\nOriginal email:\n").append(emailRequest.getEmailContent());
        return prompt.toString();
    }
}
