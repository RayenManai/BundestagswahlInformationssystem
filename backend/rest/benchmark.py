from locust import HttpUser, TaskSet, task, between
import random

class BenchmarkTaskSet(TaskSet):
    @task(25)  # Frequency for Q1
    def q1(self):
        r = random.randint(0, 1)
        year = r * 2017 + (1 - r) * 2021
        self.client.get(f"/api/results?year={year}", name='Q1')

    @task(10)  # Frequency for Q2
    def q2(self):
        r = random.randint(0, 1)
        year = r * 2017 + (1 - r) * 2021
        self.client.get(f"/api/delegates?year={year}", name='Q2')

    @task(25)  # Frequency for Q3
    def q3(self):
        r = random.randint(0, 1)
        year = r * 2017 + (1 - r) * 2021
        wahlkreis = random.randint(1, 299)
        self.client.get(f"/api/results?year={year}&wahlkreis={wahlkreis}", name='Q3')

    @task(10)  # Frequency for Q4
    def q4(self):
        r = random.randint(0, 1)
        year = r * 2017 + (1 - r) * 2021
        wahlkreis = random.randint(1, 299)
        self.client.get(f"/api/results?year={year}&wahlkreis={wahlkreis}", name='Q4')

    @task(10)  # Frequency for Q5
    def q5(self):
        r = random.randint(0, 1)
        year = r * 2017 + (1 - r) * 2021
        wahlkreis = random.randint(1, 299)
        self.client.get(f"/api/results?year={year}&wahlkreis={wahlkreis}", name='Q5')

    @task(20)  # Frequency for Q6
    def q6(self):
        r = random.randint(0, 1)
        year = r * 2017 + (1 - r) * 2021
        wahlkreis = random.randint(1, 299)
        self.client.get(f"/api/results?year={year}&wahlkreis={wahlkreis}", name='Q6')

class BenchmarkUser(HttpUser):
    tasks = [BenchmarkTaskSet]
    wait_time = between(0.8, 1.2)  # Average wait time
