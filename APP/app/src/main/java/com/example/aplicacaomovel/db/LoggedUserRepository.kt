package com.example.aplicacaomovel.db



import com.example.aplicacaomovel.DAO.LoggedUserDao
import com.example.aplicacaomovel.Enteties.LoggedUser
import kotlinx.coroutines.flow.Flow


class LoggedUserRepository(private val loggedUserDao: LoggedUserDao) {

    val loggedUser: Flow<LoggedUser?> = loggedUserDao.getFlowingUser()

    suspend fun insert(loggedUser: LoggedUser) {
        loggedUserDao.insert(loggedUser)
    }

}