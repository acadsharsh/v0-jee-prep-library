'use client';

import { Navigation } from '@/components/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const sampleData = [
  { name: 'Ch 1', score: 75 },
  { name: 'Ch 2', score: 82 },
  { name: 'Ch 3', score: 68 },
  { name: 'Ch 4', score: 90 },
  { name: 'Ch 5', score: 78 },
];

export default function DashboardPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Your Dashboard</h1>
            <p className="text-muted-foreground">Track your progress and performance</p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Attempts</p>
              <p className="text-4xl font-bold">12</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Average Score</p>
              <p className="text-4xl font-bold">79%</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Global Rank</p>
              <p className="text-4xl font-bold">#247</p>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card className="p-6 mb-12">
            <h2 className="text-2xl font-bold mb-6">Performance by Chapter</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sampleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Recent Attempts */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Recent Attempts</h2>
            <div className="space-y-3">
              {[
                { title: 'Circular Motion', score: 90, date: 'Today' },
                { title: 'Rotational Motion', score: 75, date: 'Yesterday' },
                { title: 'Simple Harmonic Motion', score: 82, date: '2 days ago' },
              ].map((attempt, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <p className="font-semibold">{attempt.title}</p>
                    <p className="text-sm text-muted-foreground">{attempt.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{attempt.score}%</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="mt-8">
            <Link href="/">
              <Button variant="outline">Back to Library</Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
