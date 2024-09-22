package com.example.aplicacaomovel

import android.nfc.cardemulation.HostApduService
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.annotation.RequiresApi

@RequiresApi(Build.VERSION_CODES.KITKAT)
class MyHostApduService : HostApduService() {

    companion object {
        val SELECT_AID_APDU = byteArrayOf(
            0x00, 0xA4.toByte(), 0x04, 0x00, 0x07,
            0xA0.toByte(), 0x00, 0x00, 0x02, 0x47, 0x10, 0x01
        )
        val SUCCESS_RESPONSE = byteArrayOf(0x90.toByte(), 0x00)
    }

    override fun processCommandApdu(commandApdu: ByteArray?, extras: Bundle?): ByteArray {
        commandApdu ?: return ByteArray(0).also {
            log("APDU recebido é nulo")
        }

        log("APDU recebido: ${commandApdu.joinToString("") { "%02X".format(it) }}")

        return when {
            commandApdu.contentEquals(SELECT_AID_APDU) -> {
                log("APDU correspondente encontrado")
                SUCCESS_RESPONSE
            }
            else -> {
                log("Comando APDU não suportado")
                byteArrayOf(0x6A.toByte(), 0x82.toByte()) // Comando não suportado
            }
        }
    }

    override fun onDeactivated(reason: Int) {
        log("Comunicação NFC Desativada: Motivo $reason")
    }

    private fun log(message: String) {
        Log.d("MyHostApduService", message)
    }
}
