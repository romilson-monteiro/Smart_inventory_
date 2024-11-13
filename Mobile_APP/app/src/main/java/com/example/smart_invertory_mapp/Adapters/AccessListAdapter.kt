package com.example.smart_invertory_mapp.Adapters


import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.aplicacaomovel.Dataclasses.AccessItem
import com.example.smart_invertory_mapp.R

class AccessListAdapter(private val accessList: ArrayList<AccessItem>) :
    RecyclerView.Adapter<AccessListAdapter.AccessViewHolder>() {

    inner class AccessViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val accessIcon: ImageView = itemView.findViewById(R.id.accessIcon)
        val roomName: TextView = itemView.findViewById(R.id.roomName)
        val accessTime: TextView = itemView.findViewById(R.id.accessTime)
        val accessStatus: ImageView = itemView.findViewById(R.id.accessStatus)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AccessViewHolder {
        val itemView = LayoutInflater
            .from(parent.context)
            .inflate(R.layout.acess_linha, parent, false)
        return AccessViewHolder(itemView)
    }

    override fun getItemCount(): Int {
        return accessList.size
    }

    override fun onBindViewHolder(holder: AccessViewHolder, position: Int) {
        val currentAccessItem = accessList[position]

        // Set access icon based on the access method
        if (currentAccessItem.accessMethod == "nfc") {
            holder.accessIcon.setImageResource(R.drawable.nfc)
        } else if (currentAccessItem.accessMethod == "fingerprint") {
            holder.accessIcon.setImageResource(R.drawable.finger)
        }

        holder.roomName.text = currentAccessItem.roomName
        holder.accessTime.text = currentAccessItem.accessTime

        // Set access status icon based on access permission
        if (currentAccessItem.accessPermitted) {
            holder.accessStatus.setImageResource(R.drawable.ic_acept)
        } else {
            holder.accessStatus.setImageResource(R.drawable.ic_rejected)
        }
    }
}
