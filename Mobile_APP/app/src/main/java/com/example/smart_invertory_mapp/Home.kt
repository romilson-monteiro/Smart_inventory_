package com.example.aplicacaomovel

import android.annotation.SuppressLint
import android.content.Intent
import android.nfc.NfcAdapter
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.core.app.ComponentActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.aplicacaomovel.Adapters.AccessListAdapter
import com.example.aplicacaomovel.Dataclasses.AccessItem
import com.example.aplicacaomovel.Enteties.LoggedUser
import com.example.aplicacaomovel.api.Access
import com.example.aplicacaomovel.api.EndPoints
import com.example.aplicacaomovel.api.ServiceBuilder
import com.example.aplicacaomovel.db.AppDatabase
import com.example.aplicacaomovel.db.LoggedUserRepository
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

@SuppressLint("RestrictedApi")
class Home : ComponentActivity() {


    private lateinit var loggedUserRepository: LoggedUserRepository
    private lateinit var progressBar: ProgressBar

    @RequiresApi(Build.VERSION_CODES.KITKAT)
    @SuppressLint("RestrictedApi")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home)

        // Inicializar o repositório com o DAO
        val loggedUserDao = AppDatabase.getInstance(applicationContext).loggedUserDao()
        loggedUserRepository = LoggedUserRepository(loggedUserDao)

    }

    @RequiresApi(Build.VERSION_CODES.KITKAT)
    override fun onResume() {
        super.onResume()
        lifecycleScope.launch {
            loggedUserRepository.loggedUser.collect { user ->
                user?.let {
                    updateUiWithLoggedUserInfo(it)
                    setupAccessListRecyclerView(it.id)
                }
            }
        }

        // Configurar botões e outros elementos de UI
        setupUiElements()

        initializeNfc()
    }

    private fun setupAccessListRecyclerView(id: Int) {
        val request = ServiceBuilder.buildService(EndPoints::class.java)
        // Substitua "1" pelo ID do usuário desejado ou passe como parâmetro
        val call = request.getAccessesByUser(id)
        val accessList = ArrayList<AccessItem>()
        val adapter = AccessListAdapter(accessList) // Certifique-se que este adapter está correto.
        val recyclerView = findViewById<RecyclerView>(R.id.recView)
        recyclerView.adapter = adapter
        recyclerView.layoutManager = LinearLayoutManager(this)
        progressBar = findViewById(R.id.progressBar)
        progressBar.visibility = View.VISIBLE

        call.enqueue(object : Callback<List<Access>> {
            @SuppressLint("NotifyDataSetChanged")
            override fun onResponse(call: Call<List<Access>>, response: Response<List<Access>>) {
                if (response.isSuccessful) {
                    val accesses = response.body()?.take(10) ?: return
                    accesses.forEach { access ->
                        Log.d("Access", "ID: ${access.id}, Método de Auth: ${access.metodo_auth}")
                        val item = AccessItem(
                            access.metodo_auth,
                            "Room ${access.id_area}", // Assumindo que você vai mapear id_area para nome do local
                            formatarData(access.data_hora_entrada),
                            access.acesso_permitido
                        )
                        accessList.add(item)
                    }
                    progressBar.visibility = View.GONE
                    // Notifique o adapter fora do loop após adicionar todos os itens
                    adapter.notifyDataSetChanged()
                } else {
                    // Tratar resposta não bem-sucedida
                }
            }

            override fun onFailure(call: Call<List<Access>>, t: Throwable) {
                progressBar.visibility = View.GONE
            }
        })
    }

    fun formatarData(dataString: String): String {
        val formatoEntrada = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
        formatoEntrada.timeZone = TimeZone.getTimeZone("UTC") // A data está em UTC
        val data: Date = formatoEntrada.parse(dataString) ?: return "Data inválida"

        val formatoSaida = SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale.getDefault())
        return formatoSaida.format(data)
    }

    private fun setupUiElements() {
        val moreAccess = findViewById<TextView>(R.id.viewMoreText)
        moreAccess.setOnClickListener {
            val intent = Intent(this, Accesses::class.java)
            startActivity(intent)
        }

        val btnPerfil = findViewById<ImageButton>(R.id.Perfil)
        btnPerfil.setOnClickListener {
            val intent = Intent(this, Perfil::class.java)
            startActivity(intent)
        }
    }

    private fun updateUiWithLoggedUserInfo(user: LoggedUser) {
        val userName: TextView = findViewById(R.id.textViewNome)
        val emailTextView: TextView = findViewById(R.id.textViewEmail)
        val accessLevel: TextView = findViewById(R.id.textViewClasse)
        userName.text = "${user.firstName} ${user.lastName}"
        emailTextView.text = user.email
        accessLevel.text = "Nivel de acesso:" + user.accessLevel.toString() + "/5"
    }

    @RequiresApi(Build.VERSION_CODES.KITKAT)
    private fun initializeNfc() {
        val nfcAdapter = NfcAdapter.getDefaultAdapter(this)
        if (nfcAdapter == null) {
        } else {
            if (!nfcAdapter.isEnabled) {

            } else {

                startNfcService()
            }
        }
    }

    @RequiresApi(Build.VERSION_CODES.KITKAT)
    private fun startNfcService() {
        // Start your HCE service
        val intent = Intent(this, MyHostApduService::class.java)
        startService(intent)
    }
}


