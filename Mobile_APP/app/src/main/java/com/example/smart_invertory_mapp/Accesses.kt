package com.example.aplicacaomovel

import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import android.widget.ArrayAdapter
import android.widget.Spinner
import androidx.activity.ComponentActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.aplicacaomovel.Adapters.AccessListAdapter
import com.example.aplicacaomovel.Dataclasses.AccessItem
import com.example.aplicacaomovel.api.Access
import com.example.aplicacaomovel.api.EndPoints
import com.example.aplicacaomovel.api.ServiceBuilder
import com.example.aplicacaomovel.db.AppDatabase
import com.example.aplicacaomovel.db.LoggedUserRepository
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class Accesses : ComponentActivity() {
    private lateinit var loggedUserRepository: LoggedUserRepository
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_accesses)

        // Initialize and set up the date filter spinner
        val dateFilterSpinner = findViewById<Spinner>(R.id.dateFilterSpinner)
        val dateFilterAdapter = ArrayAdapter.createFromResource(
            this,
            R.array.date_filter_options,
            android.R.layout.simple_spinner_item
        )
        dateFilterAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        dateFilterSpinner.adapter = dateFilterAdapter

        // Initialize and set up the access type filter spinner
        val accessTypeFilterSpinner = findViewById<Spinner>(R.id.accessTypeFilterSpinner)
        val accessTypeFilterAdapter = ArrayAdapter.createFromResource(
            this,
            R.array.access_type_filter_options,
            android.R.layout.simple_spinner_item
        )
        accessTypeFilterAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        accessTypeFilterSpinner.adapter = accessTypeFilterAdapter

        // Inicializar o repositório com o DAO
        val loggedUserDao = AppDatabase.getInstance(applicationContext).loggedUserDao()
        loggedUserRepository = LoggedUserRepository(loggedUserDao)
    }



    private fun setupAccessListRecyclerView(id: Int) {
        val request = ServiceBuilder.buildService(EndPoints::class.java)
        // Substitua "1" pelo ID do usuário desejado ou passe como parâmetro
        val call = request.getAccessesByUser(id)
        val accessList = ArrayList<AccessItem>()
        val adapter = AccessListAdapter(accessList) // Certifique-se que este adapter está correto.
        val recyclerView = findViewById<RecyclerView>(R.id.accessRecyclerView)
        recyclerView.adapter = adapter
        recyclerView.layoutManager = LinearLayoutManager(this)

        call.enqueue(object : Callback<List<Access>> {
            @SuppressLint("NotifyDataSetChanged")
            override fun onResponse(call: Call<List<Access>>, response: Response<List<Access>>) {
                if (response.isSuccessful) {
                    val accesses = response.body() ?: return
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
                    // Notifique o adapter fora do loop após adicionar todos os itens
                    adapter.notifyDataSetChanged()
                } else {
                    // Tratar resposta não bem-sucedida
                }
            }

            override fun onFailure(call: Call<List<Access>>, t: Throwable) {
                // Tratar falha na chamada
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

}
