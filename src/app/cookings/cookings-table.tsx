"use client"

import ConfirmDelete from "~/components/confirm-delete"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { api } from "~/trpc/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function CookingsTable() {
  const [name, setName] = useState("")
  const router = useRouter()
  const cookings = api.cooking.search.useQuery({
    name,
  })
  const utils = api.useUtils()
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  const deleteMutation = api.cooking.delete.useMutation({
    onSuccess: async () => {
      await utils.cooking.search.invalidate()
      router.refresh()
    },
  })

  return (
    <>
      <div className="flex gap-4">
        <Input
          className="w-auto"
          placeholder="Search by name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Button onClick={() => router.push("/cookings/new")}>Create</Button>
      </div>
      <Table className="text-left">
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cookings.data?.map((cooking) => (
            <TableRow key={cooking.id}>
              <TableCell>{cooking.id}</TableCell>
              <TableCell>{cooking.name}</TableCell>
              <TableCell className="flex gap-4">
                <Button onClick={() => router.push(`/cookings/${cooking.id}`)}>
                  Edit
                </Button>
                <ConfirmDelete
                  onConfirm={() => deleteMutation.mutate({ id: cooking.id })}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
