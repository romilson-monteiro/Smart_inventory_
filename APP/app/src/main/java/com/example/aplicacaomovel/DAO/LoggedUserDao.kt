package com.example.aplicacaomovel.DAO

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.aplicacaomovel.Enteties.LoggedUser
import kotlinx.coroutines.flow.Flow

@Dao
interface LoggedUserDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(user: LoggedUser)

    @Query("SELECT * FROM logged_user_table")
    fun getFlowingUser(): Flow<LoggedUser?>

}