package com.example.aplicacaomovel

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.lifecycle.lifecycleScope
import com.example.aplicacaomovel.Enteties.LoggedUser
import com.example.aplicacaomovel.db.AppDatabase
import com.example.aplicacaomovel.db.LoggedUserRepository
import kotlinx.coroutines.launch

class Perfil : ComponentActivity() {
    private lateinit var loggedUserRepository: LoggedUserRepository
    private lateinit var loginBtn: Button
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_perfil)

        // Inicializar o repositório com o DAO
        val loggedUserDao = AppDatabase.getInstance(applicationContext).loggedUserDao()
        loggedUserRepository = LoggedUserRepository(loggedUserDao)

        lifecycleScope.launch {
            loggedUserRepository.loggedUser.collect { user ->
                user?.let {
                    updateUiWithLoggedUserInfo(it)
                }
            }
        }


    }



    @SuppressLint("SetTextI18n")
    private fun updateUiWithLoggedUserInfo(user: LoggedUser){
        val userName: TextView = findViewById(R.id.userNameTextView)
        val idTextView: TextView = findViewById(R.id.userIdTextView)
        val emailTextView: TextView = findViewById(R.id.userEmailTextView)
        val phoneTextView: TextView = findViewById(R.id.userPhoneTextView)
        userName.text = user.firstName + " " + user.lastName
        emailTextView.text = user.email
        idTextView.text = "ID: " + user.id.toString()
        phoneTextView.text = user.phone.toString()
    }

    fun fazerLogout(context: Context) {
        val sharedPreferences = context.getSharedPreferences("PreferenciasDoApp", Context.MODE_PRIVATE)
        val editor = sharedPreferences.edit()
        editor.remove("TokenDeSessao")
        editor.apply()

        // Redireciona o utilizador para a tela de login
    }

}