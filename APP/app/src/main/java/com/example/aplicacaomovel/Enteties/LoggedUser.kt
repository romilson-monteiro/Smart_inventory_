package com.example.aplicacaomovel.Enteties

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "logged_user_table")
class LoggedUser(
    @PrimaryKey
    val id: Int,
    val firstName: String,
    val lastName: String,
    val nfcTag: String,
    val email: String,
    val phone: Int,
    val accessLevel: Int
)