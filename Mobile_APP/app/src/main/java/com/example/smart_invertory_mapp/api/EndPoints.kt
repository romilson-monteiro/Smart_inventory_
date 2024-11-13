package com.example.aplicacaomovel.api

import retrofit2.Call
import retrofit2.http.*
interface EndPoints {

    @Headers("Content-Type: application/json")
    @POST("user/userlogin")
    fun loginUser(@Body loginRequest: LoginRequest): Call<LoginResponse>

    @GET("acesses/user/{userId}")
    fun getAccessesByUser(@Path("userId") userId: Int): Call<List<Access>>
}