"use client"
import React, { useEffect, useState } from 'react'
import Sidebar from '../Sidebar/page'
import Navbar from '../Navbar/page'
import axios from 'axios'

type Message = {
  id: number
  name: string
  email: string
  subject: string
  message: string
  date?: string
  status?: "New" | "Read" | "Replied"
  avatar?: string | null
  initials?: string
}

const Page = () => {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/message/`,
          { withCredentials: true }
        )
        const data = response.data.messages.map((msg: any, index: number) => ({
  id: msg.id || index,
  name: msg.name,
  email: msg.email,
  subject: msg.subject,
  message: msg.message,
  date: msg.date || "Yesterday",
  status: msg.status || "New",
  avatar: msg.avatar || null,
  initials: msg.initials || (msg.name ? msg.name.split(" ").map((n:string) => n[0]).join("").toUpperCase() : "NA"),
}))
        setMessages(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchMessage()
  }, [])

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="md:ml-24 lg:ml-40 flex-1 p-4 md:p-8 bg-background-light">
          <div className="flex flex-col min-w-[800px] h-full">
            <div className="flex-1 overflow-hidden rounded-xl border border-border-light bg-white shadow-sm flex flex-col">
              <table className="w-full text-left border-collapse">
                <thead className="bg-primary sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 w-15 text-center border-b border-border-light">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border-light bg-transparent text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-text-dark text-xs font-semibold uppercase tracking-wider border-b border-border-light w-62">
                      Sender
                    </th>
                    <th className="px-4 py-3 text-text-dark text-xs font-semibold uppercase tracking-wider border-b border-border-light w-50">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-text-dark text-xs font-semibold uppercase tracking-wider border-b border-border-light">
                      Message
                    </th>
                    <th className="px-4 py-3 text-text-dark text-xs font-semibold uppercase tracking-wider border-b border-border-light w-30">
                      Date
                    </th>
                    <th className="px-4 py-3 text-text-dark text-xs font-semibold uppercase tracking-wider border-b border-border-light w-25 text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {messages.map((msg) => (
                    <tr
                      key={msg.id}
                      className={`hover:bg-primary/5 transition-colors group cursor-pointer ${
                        msg.status === "Replied" ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          defaultChecked={msg.status === "Replied"}
                          className="h-4 w-4 rounded border-border-light bg-transparent text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {msg.avatar ? (
                            <div
                              className="bg-center bg-no-repeat bg-cover rounded-full size-9 shrink-0"
                              style={{ backgroundImage: `url("${msg.avatar}")` }}
                              data-alt={`Portrait of ${msg.name}`}
                            ></div>
                          ) : (
                            <div className="flex items-center justify-center rounded-full size-9 shrink-0 font-bold text-sm bg-primary/20 text-text-dark">
                              {msg.initials}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <p className="text-text-dark text-sm font-medium truncate">
                              {msg.name}
                            </p>
                            <p className="text-subtle-light text-xs truncate">
                              {msg.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-dark text-sm font-medium">
                        {msg.subject}
                      </td>
                      <td className="px-4 py-3 text-subtle-light text-sm truncate max-w-75">
                        {msg.message}
                      </td>
                      <td className="px-4 py-3 text-subtle-light text-sm whitespace-nowrap w-30">
                        {msg.date}
                      </td>
                      <td className="px-4 py-3 text-right w-25">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            msg.status === "New"
                              ? "bg-primary/20 text-text-dark"
                              : msg.status === "Replied"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {msg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Page
