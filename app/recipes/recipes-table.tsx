"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table"
import { api } from "@/trpc/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RecipesTable() {
  const [name, setName] = useState("")
  const router = useRouter()
  const recipes = api.recipe.search.useQuery({
    name,
  })

  return (
    <div className="mx-auto w-8/12">
      <div className="flex gap-4">
        <Input
          className="w-auto"
          placeholder="Search by name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        {/* <CreateRecipeDialog /> */}
        <Button onClick={() => router.push("recipes/new")}>Create</Button>
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
          {recipes.data?.map((recipe) => (
            <TableRow key={recipe.id}>
              <TableCell>{recipe.id}</TableCell>
              <TableCell>{recipe.name}</TableCell>
              <TableCell className="flex gap-4">
                <Button onClick={() => router.push(`recipes/${recipe.id}`)}>
                  Edit
                </Button>
                <Button variant="destructive">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
