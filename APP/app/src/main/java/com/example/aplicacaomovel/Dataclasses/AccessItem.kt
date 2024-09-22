package com.example.aplicacaomovel.Dataclasses


data class AccessItem(
    val accessMethod: String,  // "NFC" or "Fingerprint"
    val roomName: String,
    val accessTime: String,
    val accessPermitted: Boolean
)
