package com.example.aplicacaomovel.viewModel


import androidx.lifecycle.*
import com.example.aplicacaomovel.Enteties.LoggedUser
import com.example.aplicacaomovel.db.LoggedUserRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.launch

class LoggedUserViewModel(private val loggedUserRepository: LoggedUserRepository) : ViewModel() {

    val loggedUser: Flow<LoggedUser?> = loggedUserRepository.loggedUser


    fun insertLoggedUser(loggedUser: LoggedUser) {
        viewModelScope.launch {
            loggedUserRepository.insert(loggedUser)
        }
    }
}


class CityViewModelFactory(private val loggedUserRepository: LoggedUserRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(LoggedUserViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return LoggedUserViewModel(loggedUserRepository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}