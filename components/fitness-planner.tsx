"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  age: z.number().min(1).max(120),
  gender: z.enum(["男性", "女性", "回答しない"]),
  fitness_level: z.enum(["初心者", "中級者", "上級者"]),
  exercise_frequency: z.enum(["週1回", "週2-3回", "週4回以上"]),
})

export function FitnessPlannerComponent() {
  const [trainingMenu, setTrainingMenu] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 30,
      gender: "回答しない",
      fitness_level: "初心者",
      exercise_frequency: "週2-3回",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DIFY_BASE_URL}/workflows/run`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_DIFY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: values,
          response_mode: "blocking",
          user: "user-123",
        }),
      })

      if (!response.ok) {
        throw new Error("APIリクエストに失敗しました")
      }

      const data = await response.json()
      setTrainingMenu(data.data.outputs.text)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "エラー",
        description: "トレーニングメニューの取得に失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">フィットネスプランナー</CardTitle>
          <CardDescription className="text-center text-lg">
            あなたに最適な1日のトレーニングメニューを作成します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>年齢</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormDescription>あなたの年齢を入力してください。</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>性別</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="性別を選択してください" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="男性">男性</SelectItem>
                        <SelectItem value="女性">女性</SelectItem>
                        <SelectItem value="回答しない">回答しない</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fitness_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>フィットネスレベル</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="フィットネスレベルを選択してください" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="初心者">初心者</SelectItem>
                        <SelectItem value="中級者">中級者</SelectItem>
                        <SelectItem value="上級者">上級者</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="exercise_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>運動頻度</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="運動頻度を選択してください" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="週1回">週1回</SelectItem>
                        <SelectItem value="週2-3回">週2-3回</SelectItem>
                        <SelectItem value="週4回以上">週4回以上</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  "トレーニングメニューを生成"
                )}
              </Button>
            </form>
          </Form>
          {trainingMenu && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-primary">あなたの1日のトレーニングメニュー</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{trainingMenu}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}