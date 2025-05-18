package com.email_response_generator.dto;

import lombok.Data;

@Data
public class EmailRequest {
    private String emailContent;
    private String tone;
}
