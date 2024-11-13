package com.example.aplicacaomovel.api

data class Access (
    val id: Int,
    val id_area: Int,
    val id_user: Int,
    val data_hora_entrada: String,
    val metodo_auth: String,
    val acesso_permitido: Boolean,
    val createdAt: String,
    val updatedAt: String
    )