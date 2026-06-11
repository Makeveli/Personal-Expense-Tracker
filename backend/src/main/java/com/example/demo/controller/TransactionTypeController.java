package com.example.demo.controller;

import com.example.demo.model.TransactionType;
import com.example.demo.repository.TransactionTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transaction-types")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransactionTypeController {
    private final TransactionTypeRepository transactionTypeRepository;

    @GetMapping
    public List<TransactionType> getAllTypes() {
        return transactionTypeRepository.findAll();
    }
}
