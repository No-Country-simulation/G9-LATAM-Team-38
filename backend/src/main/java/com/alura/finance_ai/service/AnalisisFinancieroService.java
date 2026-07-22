package com.alura.finance_ai.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class AnalisisFinancieroService {

        private final RestClient restClient;

        @Autowired
        public AnalisisFinancieroService(RestClient.Builder restClientBuilder){
            this.restClient = restClientBuilder.baseUrl("http://localhost:8000")
            .build();
        }

    }
