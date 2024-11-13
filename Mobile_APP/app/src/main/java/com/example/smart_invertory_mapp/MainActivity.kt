package com.example.smart_invertory_mapp

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.text.method.PasswordTransformationMethod
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import androidx.activity.ComponentActivity
import com.example.aplicacaomovel.Enteties.LoggedUser
import com.example.aplicacaomovel.api.EndPoints
import com.example.aplicacaomovel.api.LoginRequest
import com.example.aplicacaomovel.api.LoginResponse
import com.example.aplicacaomovel.api.ServiceBuilder
import com.example.smart_invertory_mapp.db.AppDatabase
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response


class MainActivity :  ComponentActivity() {
    private lateinit var  btnLogin: Button
    private lateinit var progressBar: ProgressBar
    private lateinit var loginMessage: TextView


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)


        btnLogin = findViewById(R.id.btnLogin)
        progressBar = findViewById(R.id.progressBar)

        val email = findViewById<EditText>(R.id.input_email)
        val password = findViewById<EditText>(R.id.input_password)

        password.inputType = android.text.InputType.TYPE_CLASS_TEXT or
                android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD

        // Usa a TransformationMethod para ocultar os caracteres durante a digitação
        password.transformationMethod = PasswordTransformationMethod.getInstance()


        loginMessage = findViewById(R.id.loginMessage)

        if (tokenDeSessaoExiste(this)) {
            val intent = Intent(this, Home::class.java)
            startActivity(intent)
            finish()
        }


//        Função de Login
        btnLogin.setOnClickListener {
            loginMessage.text = " "
            loginMessage.visibility = View.GONE

            val request = ServiceBuilder.buildService(EndPoints::class.java)
            val emailText = email.text.toString()
            val passwordText = password.text.toString()
            val loginRequest = LoginRequest(emailText, passwordText)


            val call = request.loginUser(loginRequest)

            val intent = Intent(this, Home::class.java)
            btnLogin.visibility = View.GONE
            progressBar.visibility = View.VISIBLE
            call.enqueue(object : Callback<LoginResponse> {
                @SuppressLint("SetTextI18n")
                override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                    if (response.isSuccessful) {
                        val loginResponse = response.body()
                        loginResponse?.let {
                             val currentUser = LoggedUser(it.user.id, it.user.firstName, it.user.lastName, it.user.nfcTag, it.user.email, it.user.phone, it.user.accessLevel)
                            guardarTokenDeSessao(this@MainActivity,it.token)
                            // Save user to Room database
                            val loggedUserDao = AppDatabase.getInstance(applicationContext).loggedUserDao()
                            GlobalScope.launch {
                                loggedUserDao.insert(currentUser)
                            }
                        }
                        progressBar.visibility = View.GONE
                        btnLogin.visibility = View.VISIBLE
                        startActivity(intent)
                    } else {
                        loginMessage.visibility = View.VISIBLE
                        loginMessage.text = "Login Recusado. Verifique suas credenciais"
                        progressBar.visibility = View.GONE
                        btnLogin.visibility = View.VISIBLE
                    }
                }

                @SuppressLint("SetTextI18n")
                override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                    loginMessage.visibility = View.VISIBLE
                    loginMessage.text = "Network error"
                    progressBar.visibility = View.GONE
                    btnLogin.visibility = View.VISIBLE
                }
            })

            startActivity(intent)

        }
    }

    fun guardarTokenDeSessao(context: Context, token: String) {
        val sharedPreferences = context.getSharedPreferences("userSession", Context.MODE_PRIVATE)
        val editor = sharedPreferences.edit()
        val currentTime = System.currentTimeMillis()
        // Supondo que o token seja válido por 7 dias (7 * 24 * 60 * 60 * 1000 milissegundos)
        val expiryTime = currentTime + (7 * 24 * 60 * 60 * 1000)

        editor.putString("userToken", token)
        editor.putLong("expiryTime", expiryTime)
        editor.apply()
    }
    fun tokenDeSessaoExiste(context: Context): Boolean {
        val sharedPreferences = context.getSharedPreferences("userSession", Context.MODE_PRIVATE)
        val expiryTime = sharedPreferences.getLong("expiryTime", 0)
        val currentTime = System.currentTimeMillis()

        return currentTime < expiryTime
    }


}




