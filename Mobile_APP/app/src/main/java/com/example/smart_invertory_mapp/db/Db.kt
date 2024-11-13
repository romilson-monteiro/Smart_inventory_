package com.example.smart_invertory_mapp.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.example.aplicacaomovel.DAO.LoggedUserDao
import com.example.aplicacaomovel.Enteties.LoggedUser

@Database(entities = [LoggedUser::class], version = 2)
abstract class AppDatabase : RoomDatabase() {
    abstract fun loggedUserDao(): LoggedUserDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: buildDatabase(context).also { INSTANCE = it }
            }
        }

        private fun buildDatabase(context: Context): AppDatabase {
            return Room.databaseBuilder(
                context.applicationContext,
                AppDatabase::class.java,
                "app_database"
            ).build()
        }
    }
}