import { MarkdownRenderer } from "@/components/markdownRender";
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@/components/ui/bubble";
import React from "react";


const py = `I'll help you get started with Pygothon (Python) code! Here are some basic starter templates:

## Basic Python Starter Code

### 1. **Hello World Program**

\`\`\`python
# Simple Hello World
print("Hello, World!")

# With user input
name = input("Enter your name: ")
print(f"Hello, {name}! Welcome to Python!")
\`\`\`

### 2. **Basic Calculator**

\`\`\`python
# Simple calculator
def calculator():
    print("Simple Calculator")
    print("1. Add")
    print("2. Subtract")
    print("3. Multiply")
    print("4. Divide")
    
    choice = input("Choose operation (1-4): ")
    num1 = float(input("Enter first number: "))
    num2 = float(input("Enter second number: "))
    
    if choice == '1':
        result = num1 + num2
    elif choice == '2':
        result = num1 - num2
    elif choice == '3':
        result = num1 * num2
    elif choice == '4':
        if num2 != 0:
            result = num1 / num2
        else:
            return "Cannot divide by zero!"
    else:
        return "Invalid choice!"
    
    return f"Result: {result}"

print(calculator())
\`\`\`

### 3. **Basic Data Structures**

\`\`\`python
# Lists, Dictionaries, and Loops
students = [
    {"name": "Alice", "age": 20, "grade": "A"},
    {"name": "Bob", "age": 22, "grade": "B"},
    {"name": "Charlie", "age": 19, "grade": "A-"}
]

# Display all students
for student in students:
    print(f"Name: {student['name']}, Age: {student['age']}, Grade: {student['grade']}")

# List comprehension
grades = [student['grade'] for student in students]
print(f"All grades: {grades}")
\`\`\`

### 4. **Function Example**

\`\`\`python
# Function with default parameters
def greet_user(name="Guest", greeting="Hello"):
    """Greet a user with a custom message"""
    return f"{greeting}, {name}!"

print(greet_user("John"))
print(greet_user("Sarah", "Hi"))
print(greet_user())
\`\`\`

### 5. **File Handling**

\`\`\`python
# Writing and reading files
# Write to file
with open("example.txt", "w") as file:
    file.write("Hello, this is a Python file!\\n")
    file.write("Line 2 of the file.")

# Read from file
try:
    with open("example.txt", "r") as file:
        content = file.read()
        print("File content:")
        print(content)
except FileNotFoundError:
    print("File not found!")
\`\`\`

### 6. **Simple Game - Number Guessing**

\`\`\`python
import random

def number_guessing_game():
    secret_number = random.randint(1, 100)
    attempts = 0
    
    print("Guess the number between 1 and 100!")
    
    while True:
        try:
            guess = int(input("Your guess: "))
            attempts += 1
            
            if guess < secret_number:
                print("Too low! Try again.")
            elif guess > secret_number:
                print("Too high! Try again.")
            else:
                print(f"Congratulations! You got it in {attempts} attempts!")
                break
        except ValueError:
            print("Please enter a valid number!")

number_guessing_game()
\`\`\`

### 7. **Simple API Request**

\`\`\`python
# Requires: pip install requests
import requests

try:
    response = requests.get("https://api.github.com")
    if response.status_code == 200:
        data = response.json()
        print(f"GitHub API status: {data.get('message', 'OK')}")
    else:
        print(f"Error: {response.status_code}")
except Exception as e:
    print(f"Error: {e}")
\`\`\`

## How to Run These Scripts

1. **Install Python**: Download from python.org
2. **Create a file**: Save with \`.py\` extension (e.g., \`app.py\`)
3. **Run in terminal**:
   \`\`\`bash
   python app.py
   \`\`\`
   or
   \`\`\`bash
   python3 app.py
   \`\`\`

## Quick Interactive Python (REPL)

Open terminal and type:
\`\`\`bash
python
\`\`\`

Then you can test code interactively:
\`\`\`python
>>> print("Hello!")
>>> 2 + 3
>>> name = "Python"
>>> name.upper()
\`\`\`

Which type of program would you like to build? I can provide more specific code based on what you want to create!
`;

const table = `### 📊 Student Database

Here is a sample table showing student information including their names, classes, and other details:

| Student ID | Name | Class | Grade | Age | City | GPA | Enrollment Date |
| :---: | :--- | :---: | :---: | :---: | :--- | :---: | :--- |
| **S001** | John Smith | 10-A | A | 16 | New York | 3.8 | 2024-09-01 |
| **S002** | Sarah Johnson | 11-B | B+ | 17 | Los Angeles | 3.5 | 2024-09-01 |
| **S003** | Michael Chen | 9-C | A- | 15 | Chicago | 3.7 | 2024-08-28 |
| **S004** | Emily Davis | 12-A | A | 18 | Houston | 4.0 | 2024-08-25 |
| **S005** | James Wilson | 10-B | B | 16 | Phoenix | 3.2 | 2024-09-02 |
| **S006** | Maria Garcia | 11-A | A+ | 17 | San Diego | 3.9 | 2024-08-30 |
| **S007** | Robert Taylor | 9-B | C+ | 14 | Dallas | 2.8 | 2024-09-03 |
| **S008** | Patricia Lee | 12-B | A- | 18 | Austin | 3.6 | 2024-08-27 |
| **S009** | David Miller | 10-C | B- | 16 | San Francisco | 3.0 | 2024-09-01 |
| **S010** | Jennifer Martinez | 11-C | A | 17 | Seattle | 3.8 | 2024-08-29 |

### 📈 Class Performance Summary

| Class | Total Students | Average GPA | Highest Grade | Lowest Grade |
| :---: | :---: | :---: | :---: | :---: |
| **9-A** | 15 | 3.4 | A | B- |
| **9-B** | 14 | 3.1 | B+ | C+ |
| **9-C** | 16 | 3.5 | A- | B |
| **10-A** | 18 | 3.6 | A | B |
| **10-B** | 17 | 3.3 | B+ | B- |
| **10-C** | 15 | 3.2 | A- | C+ |
| **11-A** | 20 | 3.7 | A+ | B+ |
| **11-B** | 19 | 3.4 | A | B |
| **11-C** | 18 | 3.6 | A | B+ |
| **12-A** | 22 | 3.8 | A | B+ |
| **12-B** | 21 | 3.5 | A- | B- |

> **Note:** GPA is calculated on a 4.0 scale. Students with GPA above 3.5 are eligible for the Honor Roll.`

const page = () => {
  return (
    <div className="p-10">
      <div className=" flex w-full px-30 mx-auto flex-col gap-8 py-12  rounded-lg  border-black m-3">
        <h2 className="text-red-700 text-center">Bubble</h2>
        <Bubble align="end">
          <BubbleContent>Hey there! what&apos;s up?</BubbleContent>
        </Bubble>
        <BubbleGroup>
          <Bubble variant="muted">
            <BubbleContent>Hey! Want to see chat bubbles?</BubbleContent>
          </Bubble>
          <Bubble>
            <BubbleContent>
              I am very happy and now I am in the hall with Friends.
            </BubbleContent>
            <BubbleReactions>
              <span>👍</span>
              <span>🔥</span>
              <span>👀</span>
              <span>+2</span>
            </BubbleReactions>
          </Bubble>
        </BubbleGroup>

        <Bubble variant={"secondary"} align="start">
          <BubbleContent>
            <MarkdownRenderer content={py} />
          </BubbleContent>
        </Bubble>
        <BubbleGroup>
          <Bubble align="end">
            <BubbleContent>Just wait i am giving you the code!</BubbleContent>
          </Bubble>
          <Bubble align="end" variant={"ghost"} >
            <BubbleContent>
               hi <MarkdownRenderer content={table}/>
            </BubbleContent>
          </Bubble>
        </BubbleGroup>
      </div>
    </div>
  );
};

export default page;
