export const LEARN_LESSONS = [
    {
        id: "dsa",
        title: "DSA",
        eyebrow: "Data structures & algorithms",
        summary:
            "Master core patterns for arrays, linked lists, trees, sorting, searching, and dynamic programming.",
        chips: ["Efficient problem solving", "Algorithm design", "Data organization"],
        sections: [
            {
                title: "Arrays and iteration",
                description: `Arrays are the fundamental data structure in computer science. An array is a contiguous block of memory that stores elements of the same type. When you create an array, the system allocates a fixed amount of memory based on the size you specify. Because all elements are stored right next to each other in memory, accessing any element by its index takes constant time O(1)—the computer can calculate the exact memory address instantly.

Iteration through an array is the most basic operation: you start at index 0 and move through each element sequentially. This linear scan takes O(n) time. Understanding iteration is crucial because almost every algorithm builds on this: you'll iterate to find values, compare elements, build new structures, or transform data. The key insight is that iteration happens at the application level—even though array access is instant, examining each element requires n steps.

Arrays are fixed-size in most languages. This means if you allocate an array for 100 elements, you can't store 101 elements without creating a new array and copying everything over. Modern languages like Python, JavaScript, and C# provide dynamic arrays (lists) that handle resizing automatically, but the underlying principle remains the same: contiguous memory for fast access.

When you iterate, you track your position using an index. Off-by-one errors are incredibly common—starting at 1 instead of 0, or stopping at the wrong boundary. Always clarify: do you iterate while i < length or i <= length? Do you start at 0 or 1? Establishing these conventions early prevents bugs.`,
                bullets: [
                    "Arrays provide O(1) random access to any element by index",
                    "Iteration requires O(n) time because you examine each element sequentially",
                    "Arrays have fixed size; resizing requires creating a new array and copying data",
                    "Off-by-one errors are extremely common—always verify loop bounds",
                ],
                exampleTitle: "Processing temperature readings with iteration",
                examples: {
                    python: `# Real-world example: Analyzing temperature sensor data
temperatures = [72.5, 71.0, 98.5, 73.0, 72.8, 150.0, 71.5]

# Step 1: Calculate the average temperature
total = 0
for temp in temperatures:
    total = total + temp
average = total / len(temperatures)

# Step 2: Find temperature anomalies (outliers)
outliers = []
for i in range(len(temperatures)):
    if abs(temperatures[i] - average) > 20:
        outliers.append((i, temperatures[i]))

print(f"Average temperature: {average:.1f}")
print(f"Anomalies detected: {outliers}")`,
                    csharp: `// Real application: Process sensor data from IoT devices
double[] temperatures = { 72.5, 71.0, 98.5, 73.0, 72.8, 150.0, 71.5 };

// Calculate running average
double total = 0;
for (int i = 0; i < temperatures.Length; i++) {
    total += temperatures[i];
}
double average = total / temperatures.Length;

// Identify sensors with unusual readings
var anomalies = new List<(int sensorId, double reading)>();
for (int i = 0; i < temperatures.Length; i++) {
    if (Math.Abs(temperatures[i] - average) > 20) {
        anomalies.Add((i, temperatures[i]));
    }
}

Console.WriteLine(\$"Average: {average:F1}°F");
foreach (var anomaly in anomalies) {
    Console.WriteLine(\$"Sensor {anomaly.sensorId}: {anomaly.reading}°F");
}`,
                    java: `// Real use case: Analyze inventory stock levels
int[] inventoryLevels = {45, 23, 67, 45, 89, 234, 56};

// Calculate total items in warehouse
int sum = 0;
for (int i = 0; i < inventoryLevels.length; i++) {
    sum += inventoryLevels[i];
}
double average = (double) sum / inventoryLevels.length;

// Find items that need reordering (high stock)
System.out.println("Items requiring reorder (high stock):");
for (int i = 0; i < inventoryLevels.length; i++) {
    if (inventoryLevels[i] > average * 1.5) {
        System.out.println("SKU " + i + ": " + inventoryLevels[i] + " units");
    }
}`,
                    javascript: `// Real scenario: Analyze daily website traffic
const dailyVisitors = [245, 312, 287, 401, 289, 1205, 298];

// Calculate average daily traffic
let sum = 0;
for (let i = 0; i < dailyVisitors.length; i++) {
    sum += dailyVisitors[i];
}
const average = sum / dailyVisitors.length;

// Identify unusual traffic spikes
const spikes = [];
for (let i = 0; i < dailyVisitors.length; i++) {
    if (dailyVisitors[i] > average * 2) {
        spikes.push({ day: i, visitors: dailyVisitors[i] });
    }
}

console.log("Average daily visitors:", Math.round(average));
console.log("Days with traffic spikes:", spikes);`,
                },
            },
            {
                title: "Hash maps and dictionaries",
                description: `A hash map (also called dictionary, hash table, or associative array) is a data structure that stores key-value pairs and allows you to retrieve values by their key in O(1) average time. This is incredibly powerful compared to arrays, which only allow numeric indices.

At its core, a hash map uses a hashing function. When you insert a key-value pair, the hash function converts the key into an array index. For example, if you store the key "email" with value "john@example.com", the hash function might map "email" to index 7, and the pair gets stored there. When you look up "email", the same hash function produces index 7 again, and you instantly retrieve the value.

The key insight is that hashing creates a mapping between keys of any type (strings, objects, tuples) and array indices. Without hashing, you couldn't have fast lookups for arbitrary keys. Hash maps are essential for problems where you need to remember associations: "Have I seen this before?" "What's the count?" "Does this exist?"

Hash collisions occur when two different keys hash to the same index. Languages handle this automatically through chaining (storing multiple pairs in a list) or open addressing. In practice, you don't need to think about collision handling—it's built in.

Hash maps are unordered by default (though modern Python and JavaScript preserve insertion order). They excel at frequency counting, deduplication, checking existence, and storing relationships. Most real-world applications rely heavily on hash maps for lookups and caching.`,
                bullets: [
                    "Hash maps provide O(1) average lookup, insertion, and deletion by key",
                    "A hash function converts any key type into an array index",
                    "Perfect for frequency counting, deduplication, and existence checks",
                    "Use when you need fast lookups by non-numeric keys",
                    "Collisions are handled automatically by the language",
                ],
                exampleTitle: "Building a word frequency analyzer",
                examples: {
                    python: `# Practical application: Analyze document for duplicate content
text = "the quick brown fox jumps over the lazy dog the fox is quick"
words = text.lower().split()

# Use dictionary to count word occurrences
word_counts = {}
for word in words:
    if word in word_counts:
        word_counts[word] = word_counts[word] + 1
    else:
        word_counts[word] = 1

# Find most common words
print("Word frequency analysis:")
for word, count in word_counts.items():
    if count > 1:
        print(f"  '{word}': appears {count} times")

# Quick lookup: verify if word appears
if 'fox' in word_counts:
    print(f"Found 'fox' {word_counts['fox']} times in text")`,
                    csharp: `// Real use: Track active users and login frequency
var userLogins = new Dictionary<string, int>();
string[] sessionLog = { "alice", "bob", "alice", "charlie", "alice", "bob", "alice" };

// Count how many times each user logged in
foreach (string user in sessionLog) {
    if (userLogins.ContainsKey(user)) {
        userLogins[user]++;
    } else {
        userLogins[user] = 1;
    }
}

// Generate login report
Console.WriteLine("User login frequency:");
foreach (var entry in userLogins) {
    Console.WriteLine(\$"  {entry.Key}: {entry.Value} logins");
}

// Quick verification: does user exist and how many times?
string targetUser = "alice";
if (userLogins.TryGetValue(targetUser, out int count)) {
    Console.WriteLine(\$"{targetUser} has {count} sessions");
}`,
                    java: `// Real scenario: Find duplicate products in large order list
String[] orders = {"book", "pen", "book", "notebook", "pen", "book"};
Map<String, Integer> productCount = new HashMap<>();

// Count how many times each product appears
for (String product : orders) {
    if (productCount.containsKey(product)) {
        productCount.put(product, productCount.get(product) + 1);
    } else {
        productCount.put(product, 1);
    }
}

// Report duplicate items for inventory
System.out.println("Duplicate products in orders:");
for (Map.Entry<String, Integer> entry : productCount.entrySet()) {
    if (entry.getValue() > 1) {
        System.out.println(entry.getKey() + ": " + entry.getValue() + " units");
    }
}`,
                    javascript: `// Real application: Build IP access log analyzer
const accessLog = [
    "192.168.1.1", "10.0.0.5", "192.168.1.1",
    "172.16.0.1", "192.168.1.1", "10.0.0.5"
];

// Create hash map to count requests per IP
const ipCounts = {};
for (let ip of accessLog) {
    if (ipCounts[ip]) {
        ipCounts[ip]++;
    } else {
        ipCounts[ip] = 1;
    }
}

// Display access statistics
console.log("Access frequency per IP address:");
for (let ip in ipCounts) {
    console.log(\`  \${ip}: \${ipCounts[ip]} requests\`);
}

// Instant lookup: identify if specific IP is attacker
if (ipCounts["192.168.1.1"]) {
    console.log("Alert: 192.168.1.1 made " + ipCounts["192.168.1.1"] + " requests");
}`,
                },
            },
            {
                title: "Linked lists",
                description: `A linked list is a chain of nodes where each node stores a value and a pointer to the next node. Unlike arrays stored in contiguous memory, linked list nodes can be scattered throughout memory, connected only by pointers.

Each node contains data and a "next" pointer. The first node is called the head, and the last node's next pointer is null. To traverse a linked list, you start at the head and follow pointers sequentially.

Linked lists trade random access speed for insertion/deletion efficiency. Accessing element at index 0 is O(1), but accessing element at index n is O(n) because you must traverse from the head. However, if you already have a pointer to a location, inserting or removing is O(1)—just update a few pointers.

When to use linked lists? When you frequently insert/delete at the beginning or middle (not end). They're also memory-efficient for sparse data—you allocate only when needed. Most modern applications prefer arrays or dynamic arrays unless they have specific insertion/deletion patterns that benefit from linked lists.

Understanding linked lists teaches pointer manipulation, essential for understanding trees, graphs, and advanced data structures.`,
                bullets: [
                    "Linked lists: nodes scattered in memory, connected by pointers",
                    "O(1) insertion/deletion at known position with just pointer updates",
                    "O(n) traversal to find an element (must start from head)",
                    "Memory efficient: allocate only when adding nodes",
                    "More memory overhead per node due to pointer storage",
                ],
                exampleTitle: "Managing a playlist with linked list operations",
                examples: {
                    python: `class Song:
    def __init__(self, title):
        self.title = title
        self.next = None

class Playlist:
    def __init__(self):
        self.head = None
    
    def add_song(self, title):
        song = Song(title)
        if not self.head:
            self.head = song
        else:
            current = self.head
            while current.next:
                current = current.next
            current.next = song
    
    def display(self):
        current = self.head
        num = 1
        while current:
            print(f"{num}. {current.title}")
            current = current.next
            num += 1

playlist = Playlist()
playlist.add_song("Song A")
playlist.add_song("Song B")
playlist.add_song("Song C")
playlist.display()`,
                    csharp: `class Song { public string Title { get; set; }; public Song Next { get; set; } }

class Playlist {
    private Song head = null;
    
    public void AddSong(string title) {
        Song song = new Song { Title = title };
        if (head == null) head = song;
        else {
            Song current = head;
            while (current.Next != null) current = current.Next;
            current.Next = song;
        }
    }
    
    public void Display() {
        Song current = head;
        int num = 1;
        while (current != null) {
            Console.WriteLine($"{num}. {current.Title}");
            current = current.Next;
            num++;
        }
    }
}`,
                    java: `class Song { String title; Song next; Song(String t) { title = t; } }

class Playlist {
    private Song head = null;
    
    public void addSong(String title) {
        Song song = new Song(title);
        if (head == null) head = song;
        else {
            Song current = head;
            while (current.next != null) current = current.next;
            current.next = song;
        }
    }
    
    public void display() {
        Song current = head;
        int num = 1;
        while (current != null) {
            System.out.println(num + ". " + current.title);
            current = current.next;
            num++;
        }
    }
}`,
                    javascript: `class Song {
    constructor(title) {
        this.title = title;
        this.next = null;
    }
}

class Playlist {
    constructor() { this.head = null; }
    
    addSong(title) {
        const song = new Song(title);
        if (!this.head) this.head = song;
        else {
            let current = this.head;
            while (current.next) current = current.next;
            current.next = song;
        }
    }
    
    display() {
        let current = this.head;
        let num = 1;
        while (current) {
            console.log(\`\${num}. \${current.title}\`);
            current = current.next;
            num++;
        }
    }
}`,
                },
            },
            {
                title: "Stacks and queues",
                description: `Stacks and queues are abstract data types that impose restrictions on insertion and removal to solve specific problems elegantly. Both provide O(1) push/pop or enqueue/dequeue.

A stack is LIFO (Last In, First Out): you add to the top and remove from the top. Like a plate stack, the last plate added is the first removed. Stacks are everywhere: function call stacks, undo/redo, browser back button, expression parsing.

A queue is FIFO (First In, First Out): you add to the back and remove from the front. Like a store line, first person in is first served. Queues model real processes: print job queues, message processing, breadth-first search, customer service.

The key insight: both restrict access intentionally. You can't randomly access the middle element. This constraint makes them perfect for specific algorithms. Using the wrong structure leads to bugs or inefficiency.

Implementation: both typically built on arrays (with resizing) or linked lists. Most languages provide built-in implementations. What matters is understanding when to use them and trusting the semantics—LIFO for stacks, FIFO for queues.`,
                bullets: [
                    "Stack (LIFO): last in, first out—perfect for undo/redo",
                    "Queue (FIFO): first in, first out—perfect for job processing",
                    "Both provide O(1) push/pop or enqueue/dequeue operations",
                    "Restrict access intentionally to solve problems elegantly",
                    "Use for parsing, task processing, and breadth-first search",
                ],
                exampleTitle: "Browser navigation with stack and print queue",
                examples: {
                    python: `# Stack for back button, Queue for print jobs
class BrowserStack:
    def __init__(self):
        self.history = []
    
    def visit(self, url):
        self.history.append(url)
        print(f"Visiting: {url}")
    
    def back(self):
        if len(self.history) > 1:
            self.history.pop()
            return self.history[-1]
        return None

class PrintQueue:
    def __init__(self):
        self.jobs = []
    
    def submit(self, job):
        self.jobs.append(job)
        print(f"Queued: {job}")
    
    def process(self):
        if self.jobs:
            return self.jobs.pop(0)
        return None

browser = BrowserStack()
browser.visit("google.com")
browser.visit("github.com")
print(f"Back: {browser.back()}")

printer = PrintQueue()
printer.submit("Document1.pdf")
printer.submit("Document2.pdf")
print(f"Processing: {printer.process()}")`,
                    csharp: `var browser = new Stack<string>();
browser.Push("google.com");
browser.Push("github.com");
Console.WriteLine($"Back: {browser.Pop()}");

var queue = new Queue<string>();
queue.Enqueue("job1");
queue.Enqueue("job2");
Console.WriteLine($"Process: {queue.Dequeue()}");`,
                    java: `Stack<String> browser = new Stack<>();
browser.push("google.com");
browser.push("github.com");
System.out.println("Back: " + browser.pop());

Queue<String> queue = new LinkedList<>();
queue.add("job1");
queue.add("job2");
System.out.println("Process: " + queue.remove());`,
                    javascript: `// Stack
const browser = [];
browser.push("google.com");
browser.push("github.com");
console.log("Back:", browser.pop());

// Queue
const queue = [];
queue.push("job1");
queue.push("job2");
console.log("Process:", queue.shift());`,
                },
            },
            {
                title: "Trees and recursion",
                description: `A tree is a hierarchical data structure: a root node with child nodes forming branches. Trees model relationships: file systems, organizational hierarchies, HTML DOM, family trees.

Recursion is the natural way to work with trees. Instead of loops, you define a base case (when to stop—usually at leaves) and a recursive case (process node, then recurse on children). This mirrors tree structure perfectly.

Key insight: recursion matches tree structure. Each call represents going deeper one level. When all branches return (leaves reached), results bubble back up. This makes recursion elegant for trees but requires understanding call stacks. Each recursive call uses stack space; very deep trees can overflow.

Tree traversal patterns: pre-order (node, then children), in-order (left child, node, right child), post-order (children, then node). Each pattern has different uses. Understanding recursion deeply is essential for graphs, dynamic programming, and advanced algorithms.`,
                bullets: [
                    "Trees: hierarchical structure with root and branches",
                    "Recursion mirrors tree structure naturally",
                    "Base case: when to stop (usually at leaves)",
                    "Pre/in/post-order traversal for different use cases",
                    "Call stack grows with recursion depth",
                ],
                exampleTitle: "Exploring a file system tree with recursion",
                examples: {
                    python: `class FileNode:
    def __init__(self, name, is_dir=False):
        self.name = name
        self.is_dir = is_dir
        self.children = []

# Build tree
root = FileNode("home", is_dir=True)
docs = FileNode("Documents", is_dir=True)
root.children.append(docs)
root.children.append(FileNode("resume.pdf"))
docs.children.append(FileNode("report.txt"))

# Recursive traversal
def print_tree(node, indent=0):
    prefix = "  " * indent
    kind = "[DIR]" if node.is_dir else "[FILE]"
    print(f"{prefix}{kind} {node.name}")
    for child in node.children:
        print_tree(child, indent + 1)

print_tree(root)`,
                    csharp: `class FileNode {
    public string Name { get; set; }
    public bool IsDir { get; set; }
    public List<FileNode> Children { get; set; } = new();
}

void PrintTree(FileNode node, int indent = 0) {
    string prefix = new string(' ', indent * 2);
    string kind = node.IsDir ? "[DIR]" : "[FILE]";
    Console.WriteLine($"{prefix}{kind} {node.Name}");
    foreach (var child in node.Children) {
        PrintTree(child, indent + 1);
    }
}`,
                    java: `class FileNode {
    String name;
    boolean isDir;
    List<FileNode> children = new ArrayList<>();
    FileNode(String n, boolean d) { name = n; isDir = d; }
}

void printTree(FileNode node, int indent) {
    System.out.println(" ".repeat(indent * 2) + (node.isDir ? "[DIR]" : "[FILE]") + " " + node.name);
    for (FileNode child : node.children) {
        printTree(child, indent + 1);
    }
}`,
                    javascript: `class FileNode {
    constructor(name, isDir = false) {
        this.name = name;
        this.isDir = isDir;
        this.children = [];
    }
}

function printTree(node, indent = 0) {
    const prefix = "  ".repeat(indent);
    const kind = node.isDir ? "[DIR]" : "[FILE]";
    console.log(\`\${prefix}\${kind} \${node.name}\`);
    for (let child of node.children) {
        printTree(child, indent + 1);
    }
}`,
                },
            },
            {
                title: "Sorting algorithms",
                description: `Sorting is ordering data by a criterion. It's simple conceptually but profoundly important because efficient sorting is crucial for performance.

Different algorithms have different tradeoffs. Bubble sort is O(n²)—compare adjacent elements repeatedly. Insertion sort is O(n²) but typically faster; build sorted portion by inserting each element. Both are terrible for real use but excellent for learning.

Merge sort is O(n log n)—divide recursively in half, sort each half, merge back. Efficient and predictable but uses extra space. Quick sort is also O(n log n) average (O(n²) worst case) and typically faster in practice because it works in-place with good cache locality.

Modern languages use optimized hybrids. Python's Timsort combines merge and insertion sort for real data. Understanding algorithms teaches complexity analysis, divide-and-conquer thinking, and when optimization is worth the complexity.`,
                bullets: [
                    "Bubble/insertion sort: O(n²), simple but slow",
                    "Merge/quick sort: O(n log n), efficient",
                    "Different algorithms have different space/stability tradeoffs",
                    "Modern languages use optimized hybrids",
                    "Understanding teaches complexity analysis and design patterns",
                ],
                exampleTitle: "Comparing sorting algorithms on real data",
                examples: {
                    python: `import time

def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

def quick_sort(arr):
    if len(arr) <= 1: return arr
    pivot = arr[0]
    left = [x for x in arr[1:] if x < pivot]
    right = [x for x in arr[1:] if x >= pivot]
    return quick_sort(left) + [pivot] + quick_sort(right)

data = [64, 34, 25, 12, 22, 11, 90]

start = time.time()
bubble_sort(data.copy())
print(f"Bubble: {time.time() - start:.6f}s")

start = time.time()
quick_sort(data.copy())
print(f"Quick: {time.time() - start:.6f}s")`,
                    csharp: `void BubbleSort(int[] arr) {
    for (int i = 0; i < arr.Length; i++) {
        for (int j = 0; j < arr.Length - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                (arr[j], arr[j + 1]) = (arr[j + 1], arr[j]);
            }
        }
    }
}

Array.Sort(arr);  // Use built-in`,
                    java: `Arrays.sort(arr);  // O(n log n) - uses optimized algorithm`,
                    javascript: `// Built-in sort uses optimized algorithm
arr.sort((a, b) => a - b);`,
                },
            },
            {
                title: "Binary search",
                description: `Binary search finds a target in a sorted array in O(log n) time—exponentially faster than linear search's O(n). It works by eliminating half the candidates with each comparison.

Algorithm: maintain left and right boundaries. Compare the middle element to your target. If it matches, done. If target is smaller, search left half (right becomes mid - 1). If larger, search right half (left becomes mid + 1). Repeat until found or boundaries cross.

Why log n? Each step eliminates half the data. On 1 million elements, binary search needs ~20 comparisons; linear needs ~500,000. On 1 billion elements, binary still needs ~30 comparisons.

Critical requirement: data must be sorted. This is the tradeoff—sort once for fast repeated searches. Also generalizes: find first value >= threshold, last value <= threshold, insertion position, etc.

Understanding binary search teaches divide-and-conquer thinking and why O(log n) is special.`,
                bullets: [
                    "O(log n) on sorted arrays—exponentially faster than linear search",
                    "Eliminates half remaining elements each step",
                    "Requires sorted data; doesn't work on unsorted arrays",
                    "Generalizes to find boundaries and insertion positions",
                    "Fundamental optimization technique",
                ],
                exampleTitle: "Finding users in a large sorted directory",
                examples: {
                    python: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: left = mid + 1
        else: right = mid - 1
    return -1

user_ids = [101, 205, 312, 415, 523]
print(f"Found at: {binary_search(user_ids, 312)}")`,
                    csharp: `int BinarySearch(int[] arr, int target) {
    int left = 0, right = arr.Length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
                    java: `int idx = Arrays.binarySearch(arr, target);`,
                    javascript: `function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
                },
            },
            {
                title: "Dynamic programming",
                description: `Dynamic programming solves complex problems by breaking them into overlapping subproblems and storing results to avoid recomputation. Many problems have optimal substructure: the solution to the problem contains solutions to smaller problems. Without storing intermediate results, you recompute them thousands of times, wasting time.

The two key concepts are memoization and tabulation. Memoization stores results in a dictionary as you compute them recursively (top-down approach). Tabulation builds up solutions iteratively from small problems to large (bottom-up approach). Both transform exponential-time problems into polynomial-time.

Consider the classic Fibonacci sequence: fib(5) requires computing fib(4) and fib(3), but fib(4) also computes fib(3)—duplicated work. Without memoization, fib(40) requires over a billion operations. With memoization, it's just 40 operations.

DP applies to real problems: shortest paths, resource allocation, edit distances, knapsack problems. The challenge is recognizing the optimal substructure. Once you identify it, the solution often follows a predictable pattern.`,
                bullets: [
                    "Overlapping subproblems: same subproblems computed multiple times",
                    "Optimal substructure: problem solution contains optimal solutions to subproblems",
                    "Memoization: top-down recursion with caching",
                    "Tabulation: bottom-up iteration building results",
                    "Reduces exponential complexity to polynomial",
                ],
                exampleTitle: "Computing Fibonacci efficiently with memoization",
                examples: {
                    python: `# Without memoization: exponential time
def fib_slow(n):
    if n <= 1:
        return n
    return fib_slow(n - 1) + fib_slow(n - 2)

# With memoization: linear time
memo = {}
def fib_memo(n):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n - 1) + fib_memo(n - 2)
    return memo[n]

print(fib_memo(40))  # Instant result`,
                    csharp: `Dictionary<int, long> memo = new();

long Fib(int n) {
    if (memo.ContainsKey(n)) return memo[n];
    if (n <= 1) return n;
    
    memo[n] = Fib(n - 1) + Fib(n - 2);
    return memo[n];
}

Console.WriteLine(Fib(40));  // Instant`,
                    java: `Map<Integer, Long> memo = new HashMap<>();

long fib(int n) {
    if (memo.containsKey(n)) return memo.get(n);
    if (n <= 1) return n;
    
    long result = fib(n - 1) + fib(n - 2);
    memo.put(n, result);
    return result;
}`,
                    javascript: `const memo = {};

function fib(n) {
    if (n in memo) return memo[n];
    if (n <= 1) return n;
    
    memo[n] = fib(n - 1) + fib(n - 2);
    return memo[n];
}`,
                },
            },
            {
                title: "Graphs and graph traversal",
                description: `Graphs represent relationships between entities. A graph consists of vertices (nodes) and edges (connections). Unlike trees, graphs can have cycles, multiple paths between nodes, and complex topologies. Real-world examples: social networks (people are nodes, friendships are edges), maps (cities are nodes, roads are edges), the internet (computers are nodes).

Two fundamental traversal algorithms: depth-first search (DFS) and breadth-first search (BFS). DFS explores as far as possible along each branch before backtracking—useful for finding paths and detecting cycles. BFS explores level by level—useful for shortest paths and connected components.

Adjacency list is the most common representation: store for each node a list of neighbors. Space efficient and enables fast neighbor lookup. Adjacency matrix (2D array) is faster for dense graphs but uses more memory.

Weighted graphs assign values to edges (distance, cost, weight). Algorithms like Dijkstra find shortest paths. Unweighted graphs treat all edges equally.`,
                bullets: [
                    "Vertices (nodes) and edges (connections) form graph structures",
                    "DFS: recursive/stack-based, explores deeply, finds paths and cycles",
                    "BFS: queue-based, explores level by level, finds shortest paths",
                    "Adjacency list: memory efficient, fast for sparse graphs",
                    "Weighted graphs enable shortest path and optimization algorithms",
                ],
                exampleTitle: "Traversing a social network with BFS and DFS",
                examples: {
                    python: `# Graph as adjacency list
graph = {
    "Alice": ["Bob", "Charlie"],
    "Bob": ["Alice", "David"],
    "Charlie": ["Alice"],
    "David": ["Bob", "Eve"],
    "Eve": ["David"]
}

# BFS: find shortest path between friends
from collections import deque
def bfs_shortest_path(start, goal):
    queue = deque([[start]])
    visited = set([start])
    
    while queue:
        path = queue.popleft()
        node = path[-1]
        
        if node == goal:
            return path
        
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                new_path = path + [neighbor]
                queue.append(new_path)
    
    return None

print(bfs_shortest_path("Alice", "Eve"))  # ["Alice", "Bob", "David", "Eve"]`,
                    csharp: `Dictionary<string, List<string>> graph = new() {
    { "Alice", new() { "Bob", "Charlie" } },
    { "Bob", new() { "Alice", "David" } },
    { "Charlie", new() { "Alice" } },
    { "David", new() { "Bob", "Eve" } },
    { "Eve", new() { "David" } }
};

// DFS: explore all reachable friends
HashSet<string> visited = new();

void DFS(string node) {
    if (visited.Contains(node)) return;
    visited.Add(node);
    Console.WriteLine(node);
    
    foreach (var neighbor in graph[node]) {
        DFS(neighbor);
    }
}

DFS("Alice");  // Prints: Alice, Bob, David, Eve, Charlie`,
                    java: `Map<String, List<String>> graph = new HashMap<>();
// Initialize graph...

Set<String> visited = new HashSet<>();

void dfs(String node) {
    if (visited.contains(node)) return;
    visited.add(node);
    System.out.println(node);
    
    for (String neighbor : graph.getOrDefault(node, new ArrayList<>())) {
        dfs(neighbor);
    }
}`,
                    javascript: `const graph = {
    Alice: ["Bob", "Charlie"],
    Bob: ["Alice", "David"],
    Charlie: ["Alice"],
    David: ["Bob", "Eve"],
    Eve: ["David"]
};

function bfs(start, goal) {
    const queue = [[start]];
    const visited = new Set([start]);
    
    while (queue.length > 0) {
        const path = queue.shift();
        const node = path[path.length - 1];
        
        if (node === goal) return path;
        
        for (const neighbor of (graph[node] || [])) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push([...path, neighbor]);
            }
        }
    }
    return null;
}`,
                },
            },
            {
                title: "Heaps and priority queues",
                description: `A heap is a specialized tree-based data structure that maintains a property: in a min-heap, the parent is smaller than children; in a max-heap, the parent is larger. Heaps enable efficient retrieval of minimum/maximum elements in O(log n) time.

Priority queues are commonly implemented using heaps. Instead of processing items in FIFO order, you process them by priority. Real-world examples: task schedulers (high-priority tasks execute first), network routers (important packets are forwarded first), hospital triage (urgent patients are treated first).

A complete binary tree stored in an array is the standard heap representation. Parent of element at index i is at (i-1)/2; children are at 2i+1 and 2i+2. This array representation eliminates pointer overhead.

Heap operations: insert (O(log n)) adds element and restores heap property by bubbling up. Delete-min/max (O(log n)) removes root and restores property by bubbling down. Heapify constructs a heap from unsorted array in O(n) time.

Heaps are essential for algorithms like Dijkstra (shortest path), Prim (minimum spanning tree), and efficient sorting (heapsort).`,
                bullets: [
                    "Min-heap: parent ≤ children; max-heap: parent ≥ children",
                    "Complete binary tree in array: O(1) random access",
                    "Insert and delete: O(log n) time via bubble up/down",
                    "Heapify: construct heap from unsorted array in O(n)",
                    "Applications: priority queues, shortest paths, sorting",
                ],
                exampleTitle: "Implementing a task scheduler with priority queue",
                examples: {
                    python: `import heapq

# Min-heap for task priorities (lower number = higher priority)
tasks = [(3, "Email"), (1, "Critical bug"), (2, "Feature")]
heapq.heapify(tasks)

# Process tasks in priority order
while tasks:
    priority, task = heapq.heappop(tasks)
    print(f"Processing: {task} (priority: {priority})")

# Add new task
heapq.heappush(tasks, (1, "Urgent meeting"))`,
                    csharp: `// Priority queue in .NET 6+
var pq = new PriorityQueue<string, int>();

pq.Enqueue("Email", 3);
pq.Enqueue("Critical bug", 1);
pq.Enqueue("Feature", 2);

while (pq.Count > 0) {
    string task = pq.Dequeue();
    Console.WriteLine(\$"Processing: {task}");
}`,
                    java: `PriorityQueue<String> tasks = new PriorityQueue<>();
// Note: Java's PriorityQueue stores by natural order`,
                    javascript: `// Manual heap implementation
class MinHeap {
    constructor() { this.heap = []; }
    
    push(priority, value) {
        this.heap.push({priority, value});
        this.bubbleUp(this.heap.length - 1);
    }
    
    pop() {
        if (this.heap.length === 1) return this.heap.pop();
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return min;
    }
}`,
                },
            },
            {
                title: "String processing and pattern matching",
                description: `Strings are sequences of characters. String processing includes searching for patterns, replacing substrings, matching formats, and analyzing text. Many real-world problems involve strings: autocomplete, spell checking, DNA sequence matching, regex validation.

Pattern matching algorithms determine if a pattern exists in a text. Naive approach checks every position O(n*m) where n is text length, m is pattern length. More efficient algorithms like KMP (Knuth-Morris-Pratt) and Boyer-Moore reduce this to O(n+m) by avoiding redundant comparisons using preprocessing.

String hashing enables fast substring searches. Compute a hash of pattern, then compute rolling hashes as you scan the text. Matching hashes indicate potential matches, which you verify to avoid false positives.

Regular expressions (regex) match complex patterns: emails, phone numbers, URLs. Under the hood, regex engines compile patterns to state machines and execute them against text.`,
                bullets: [
                    "Pattern matching: find occurrences of pattern in text",
                    "Naive: O(n*m); optimized: O(n+m) with preprocessing",
                    "String hashing: rolling hash enables fast substring search",
                    "Regular expressions: powerful but complex pattern matching",
                    "Applications: search, validation, text processing",
                ],
                exampleTitle: "Finding all occurrences of a pattern using hashing",
                examples: {
                    python: `def find_pattern_positions(text, pattern):
    # Simple approach: check each position
    positions = []
    for i in range(len(text) - len(pattern) + 1):
        if text[i:i+len(pattern)] == pattern:
            positions.append(i)
    return positions

text = "ababab"
pattern = "ab"
print(find_pattern_positions(text, pattern))  # [0, 2, 4]

# Regex for complex patterns
import re
emails = re.findall(r"[a-zA-Z0-9]+@[a-z]+\\.[a-z]+", "alice@example.com, bob@test.org")`,
                    csharp: `string text = "ababab";
string pattern = "ab";

// Using IndexOf repeatedly
int pos = 0;
var positions = new List<int>();
while ((pos = text.IndexOf(pattern, pos)) != -1) {
    positions.Add(pos);
    pos++;
}

// Using regex
var matches = Regex.Matches(text, @"ab");
foreach (Match m in matches) {
    Console.WriteLine(m.Index);
}`,
                    java: `String text = "ababab";
String pattern = "ab";

for (int i = 0; i <= text.length() - pattern.length(); i++) {
    if (text.substring(i, i + pattern.length()).equals(pattern)) {
        System.out.println(i);
    }
}`,
                    javascript: `const text = "ababab";
const pattern = "ab";

// Using indexOf in a loop
let positions = [];
let pos = text.indexOf(pattern);
while (pos !== -1) {
    positions.push(pos);
    pos = text.indexOf(pattern, pos + 1);
}

// Using regex
const matches = [...text.matchAll(/ab/g)];
matches.forEach(m => console.log(m.index));`,
                },
            },
            {
                title: "Two pointers and sliding window",
                description: `Two pointers technique uses two indices moving through a data structure to solve problems efficiently. Common pattern: one pointer starts at the beginning, another at the end, and they move toward each other. This eliminates the need for nested loops in many cases.

Applications: reversing arrays (left and right pointers swap elements), finding pairs that sum to target (two-sum problem), removing duplicates from sorted array. The key insight is that if data is sorted, moving one pointer while tracking the other's position eliminates redundant checks.

Sliding window is related: maintain a window of fixed or variable size and slide it through the data, updating the window content incrementally. Find longest substring without repeating characters, maximum subarray sum, minimum window containing all characters. Rather than recomputing from scratch at each position, update incrementally—reducing nested loops to single pass.

Both techniques reduce complexity from O(n²) to O(n) or O(n log n). They're particularly valuable in interviews and competitive programming.`,
                bullets: [
                    "Two pointers: use two indices to eliminate nested loops",
                    "Sorted data: enables efficient search and matching",
                    "Sliding window: incremental updates reduce recomputation",
                    "Variable window: expand/contract to maintain conditions",
                    "Common patterns: pairs, palindromes, subarrays",
                ],
                exampleTitle: "Finding pairs that sum to target with two pointers",
                examples: {
                    python: `def two_sum(arr, target):
    # Sorted array, two pointers approach
    left, right = 0, len(arr) - 1
    pairs = []
    
    while left < right:
        current_sum = arr[left] + arr[right]
        if current_sum == target:
            pairs.append((arr[left], arr[right]))
            left += 1
            right -= 1
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    
    return pairs

print(two_sum([1, 3, 5, 7, 9], 12))  # [(3, 9), (5, 7)]`,
                    csharp: `List<(int, int)> TwoSum(int[] arr, int target) {
    int left = 0, right = arr.Length - 1;
    var pairs = new List<(int, int)>();
    
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) {
            pairs.Add((arr[left], arr[right]));
            left++;
            right--;
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    
    return pairs;
}`,
                    java: `List<Integer> twoSum(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) return Arrays.asList(arr[left], arr[right]);
        if (sum < target) left++;
        else right--;
    }
    return null;
}`,
                    javascript: `function twoSum(arr, target) {
    let left = 0, right = arr.length - 1;
    const pairs = [];
    
    while (left < right) {
        const sum = arr[left] + arr[right];
        if (sum === target) {
            pairs.push([arr[left], arr[right]]);
            left++;
            right--;
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    return pairs;
}`,
                },
            },
        ],
    },
    {
        id: "ai",
        title: "AI",
        eyebrow: "Machine learning fundamentals",
        summary: "Learn core ML concepts from data preprocessing to building predictive models.",
        chips: ["Data science", "Predictive modeling", "Pattern recognition"],
        sections: [
            {
                title: "Data loading and exploration",
                description: `Machine learning always starts with data. Before you build any model, you must understand what data you have. Data exploration is the critical first step—examining your dataset to understand its structure, values, distributions, and patterns.

When you load data, you need to answer fundamental questions: How many samples (rows) do we have? How many features (columns)? What types are the features—numeric, categorical, text? Are there missing values? What's the range of values? What's the distribution? These questions guide all downstream decisions.

Data exploration involves computing descriptive statistics: mean and median tell you about central tendency, standard deviation shows spread, min/max show range. Creating visualizations like histograms reveals distributions. Correlation analysis shows which features relate to each other. Identifying outliers—values that differ dramatically from others—is critical because they can skew your models.

Understanding your data is not optional—it's essential. Many machine learning failures stem from poor data understanding. You might build a sophisticated model on biased or corrupted data and not realize until deployment. Spending time exploring data prevents wasted effort downstream.

Tools include computing summaries, creating visualizations, and asking domain questions: "Does this distribution make sense?" "Should this be numeric?" "Are these missing values ignorable or important?" Data exploration combines statistics with domain knowledge.`,
                bullets: [
                    "Always explore data before modeling: check structure, types, distributions",
                    "Compute statistics: mean, median, std dev, min, max to understand spread",
                    "Identify missing values and outliers—they signal data quality issues",
                    "Visualize distributions to see patterns and anomalies",
                    "Ask domain questions: does this data make sense for the problem?",
                ],
                exampleTitle: "Exploring student performance data",
                examples: {
                    python: `import numpy as np

# Load student performance data
scores = [85, 92, 78, 95, 88, 76, 91, 89, 94, 150]
study_hours = [5, 6, 3, 7, 5, 2, 6, 5, 7, 10]

# Calculate descriptive statistics
print("Score Distribution:")
print(f"  Mean: {np.mean(scores):.1f}")
print(f"  Median: {np.median(scores):.1f}")
print(f"  Std Dev: {np.std(scores):.1f}")
print(f"  Min: {np.min(scores)}, Max: {np.max(scores)}")

# Identify outliers (values > 2 std devs from mean)
mean_score = np.mean(scores)
std_score = np.std(scores)
outliers = [s for s in scores if abs(s - mean_score) > 2 * std_score]
print(f"\\nOutliers detected: {outliers}")
print("  Note: 150 is unrealistic - likely data entry error")`,
                    csharp: `// Explore dataset
using System;
using System.Linq;

class DataExplorer {
    static void Main() {
        double[] scores = {85, 92, 78, 95, 88, 76, 91, 89, 94, 150};
        
        double mean = scores.Average();
        double stdDev = Math.Sqrt(scores.Average(x => Math.Pow(x - mean, 2)));
        
        Console.WriteLine("Score Statistics:");
        Console.WriteLine(\$"  Mean: {mean:F1}");
        Console.WriteLine(\$"  Std Dev: {stdDev:F1}");
        Console.WriteLine(\$"  Min: {scores.Min()}, Max: {scores.Max()}");
        
        // Find outliers
        var outliers = scores.Where(s => Math.Abs(s - mean) > 2 * stdDev);
        Console.WriteLine(\$"  Outliers: {string.Join(", ", outliers)}");
    }
}`,
                    java: `import java.util.*;

class DataAnalysis {
    public static void main(String[] args) {
        double[] scores = {85, 92, 78, 95, 88, 76, 91, 89, 94, 150};
        
        // Calculate mean
        double sum = 0;
        for (double s : scores) sum += s;
        double mean = sum / scores.length;
        
        // Calculate standard deviation
        double varSum = 0;
        for (double s : scores) varSum += Math.pow(s - mean, 2);
        double stdDev = Math.sqrt(varSum / scores.length);
        
        System.out.println("Score Statistics:");
        System.out.println("  Mean: " + String.format("%.1f", mean));
        System.out.println("  Std Dev: " + String.format("%.1f", stdDev));
        
        // Find outliers
        int outlierCount = 0;
        for (double s : scores) {
            if (Math.abs(s - mean) > 2 * stdDev) {
                outlierCount++;
            }
        }
        System.out.println("  Outliers found: " + outlierCount);
    }
}`,
                    javascript: `// Analyze data distribution
function analyzeData(data) {
    const mean = data.reduce((a, b) => a + b) / data.length;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2)) / data.length;
    const stdDev = Math.sqrt(variance);
    
    console.log("Data Statistics:");
    console.log("  Mean:", mean.toFixed(1));
    console.log("  Std Dev:", stdDev.toFixed(1));
    console.log("  Min:", Math.min(...data));
    console.log("  Max:", Math.max(...data));
    
    // Find outliers
    const outliers = data.filter(x => Math.abs(x - mean) > 2 * stdDev);
    console.log("  Outliers:", outliers);
    return { mean, stdDev, outliers };
}

const scores = [85, 92, 78, 95, 88, 76, 91, 89, 94, 150];
analyzeData(scores);`,
                },
            },
            {
                title: "Feature normalization",
                description: `Different features have different scales. Imagine predicting house prices with square footage (0-10000) and rooms (1-10). Models might give disproportionate weight to square footage simply because its numbers are larger. Normalization brings features to a common scale.

Min-max normalization transforms to [0,1]: (x - min) / (max - min). Standardization centers to mean 0: (x - mean) / std_dev. Both are equally valid; choice depends on context.

Why normalize? Gradient descent algorithms perform better with similar scales. Regularization techniques penalize larger weights, so unnormalized high-magnitude features get penalized more. Tree-based models don't need normalization since they don't consider magnitude.

Critical: normalize based on training data statistics only, then apply same transformation to test data. Computing statistics on full dataset leaks test information into training, creating overly optimistic evaluation.`,
                bullets: [
                    "Brings features to common scale, preventing magnitude bias",
                    "Min-max: (x - min) / (max - min) scales to [0,1]",
                    "Standardization: (x - mean) / std_dev centers around 0",
                    "Essential for gradient descent and distance-based methods",
                    "Compute on training data only, apply to test data",
                ],
                exampleTitle: "Normalizing features for house price prediction",
                examples: {
                    python: `import numpy as np
sqft = np.array([1500, 2000, 1200, 2500])
# Min-max
norm = (sqft - sqft.min()) / (sqft.max() - sqft.min())
print(f"Normalized: {norm}")`,
                    csharp: `double min = sqft.Min(), max = sqft.Max();
var normalized = sqft.Select(x => (x - min) / (max - min));`,
                    java: `double min = Arrays.stream(sqft).min().orElse(0);
double max = Arrays.stream(sqft).max().orElse(0);`,
                    javascript: `const min = Math.min(...sqft);
const max = Math.max(...sqft);
const norm = sqft.map(x => (x - min) / (max - min));`,
                },
            },
            {
                title: "Train-test split",
                description: `Before building any model, you must split data into training and test sets. Training data teaches the model; test data measures real-world performance. Never evaluate on training data—models memorize it.

Typical split: 80% training, 20% test for small datasets. With larger datasets, smaller percentages for test suffice. Stratified split for classification: maintain class distribution in both sets.

Why separate? A model that memorizes training data achieves 100% training accuracy but fails on new data—this is overfitting. Test accuracy reveals true generalization ability.

Time-series data requires special handling: don't shuffle. Split sequentially—train on past, test on future. Shuffling leaks future information into training.

Cross-validation extends this: split data into k folds, train on k-1, test on 1. Repeat k times, rotating test fold. This gives robust estimates with limited data.`,
                bullets: [
                    "Prevents overfitting: separate data into train/test sets",
                    "Typical split: 80/20 for small data, smaller % test for large",
                    "Stratified split maintains class distribution",
                    "Time-series requires sequential split, not shuffled",
                    "Cross-validation: k-fold for robust estimates",
                ],
                exampleTitle: "Splitting data properly for classification",
                examples: {
                    python: `from sklearn.model_selection import train_test_split
X = [[1,2], [3,4], [5,6], [7,8]]
y = [0, 1, 0, 1]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print(f"Train: {len(X_train)}, Test: {len(X_test)}")`,
                    csharp: `int split = (int)(data.Count * 0.8);
var train = data.Take(split);
var test = data.Skip(split);`,
                    java: `int split = (int)(data.size() * 0.8);
List train = data.subList(0, split);
List test = data.subList(split, data.size());`,
                    javascript: `const split = Math.floor(data.length * 0.8);
const train = data.slice(0, split);
const test = data.slice(split);`,
                },
            },
            {
                title: "Classification metrics",
                description: `Accuracy alone is misleading. If 95% of emails are not spam and your model predicts "not spam" for everything, accuracy is 95% but useless. Proper evaluation requires multiple metrics.

Precision: of predicted positives, how many are actually positive? Recall: of actual positives, how many did we find? F1 score: harmonic mean of precision and recall, balances both.

Confusion matrix shows true positives, false positives, true negatives, false negatives. From this, derive precision, recall, and other metrics.

Choose metrics based on problem: for disease detection, high recall matters (catch all cases). For spam filtering, high precision matters (avoid false positives that upset users).

ROC curves plot recall vs false positive rate across thresholds. AUC (area under curve) summarizes classifier performance.`,
                bullets: [
                    "Accuracy misleading for imbalanced data",
                    "Precision: accuracy of positive predictions",
                    "Recall: fraction of positives found",
                    "F1: harmonic mean, balances precision and recall",
                    "Choose metrics based on problem domain",
                ],
                exampleTitle: "Evaluating a disease detection model",
                examples: {
                    python: `from sklearn.metrics import precision_recall_fscore_support
y_true = [1, 0, 1, 1, 0, 1]
y_pred = [1, 0, 1, 0, 0, 1]
p, r, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='binary')
print(f"Precision: {p:.2f}, Recall: {r:.2f}, F1: {f1:.2f}")`,
                    csharp: `int tp = 0, fp = 0, fn = 0;
for (int i = 0; i < y_true.Length; i++) {
    if (y_pred[i] == 1 && y_true[i] == 1) tp++;
    else if (y_pred[i] == 1 && y_true[i] == 0) fp++;
    else if (y_pred[i] == 0 && y_true[i] == 1) fn++;
}
double precision = (double)tp / (tp + fp);
double recall = (double)tp / (tp + fn);`,
                    java: `double precision = (double) tp / (tp + fp);
double recall = (double) tp / (tp + fn);
double f1 = 2 * (precision * recall) / (precision + recall);`,
                    javascript: `const precision = tp / (tp + fp);
const recall = tp / (tp + fn);
const f1 = 2 * (precision * recall) / (precision + recall);`,
                },
            },
            {
                title: "Linear regression",
                description: `Linear regression predicts continuous values by fitting a line through data points. The model learns coefficients (slope and intercept) that minimize prediction error. Simple linear regression has one input variable; multiple linear regression has many.

The goal is to find the line y = mx + b that best fits the training data. "Best fit" means minimizing error—usually measured as sum of squared differences (residuals) between predicted and actual values. This is called least squares regression.

Gradient descent is the optimization algorithm: start with random weights, compute how much to change each weight to reduce error, take small steps in that direction, repeat until convergence. The learning rate controls step size—too large and you overshoot, too small and training is slow.

Real applications: predicting house prices from features (square footage, age, bedrooms), forecasting sales from historical data, estimating project timelines from effort estimates. Linear regression is interpretable: you can see which features most affect predictions.

Limitations: assumes linear relationship. If true relationship is nonlinear (curved), linear regression performs poorly. Polynomial regression extends this to higher degrees.`,
                bullets: [
                    "Fit line y = mx + b minimizing squared errors",
                    "Least squares: minimize sum of (predicted - actual)²",
                    "Gradient descent: iteratively update weights to reduce error",
                    "Multiple inputs: extend to y = w₁x₁ + w₂x₂ + ... + b",
                    "Interpretable: coefficients show feature importance",
                ],
                exampleTitle: "Predicting house prices with linear regression",
                examples: {
                    python: `from sklearn.linear_model import LinearRegression
import numpy as np

# Training data: square footage vs price
sqft = np.array([[1000], [1500], [2000], [2500]])
prices = np.array([250000, 350000, 450000, 550000])

# Train model
model = LinearRegression()
model.fit(sqft, prices)

# Predict
new_sqft = np.array([[1800]])
predicted_price = model.predict(new_sqft)
print(f"Predicted price: \${predicted_price[0]:,.0f}")

# Model parameters
print(f"Price per sqft: \${model.coef_[0]:.2f}")
print(f"Base price: \${model.intercept_:,.0f}")`,
                    csharp: `// Using OxyPlot for regression
var data = new[] {
    (sqft: 1000, price: 250000),
    (sqft: 1500, price: 350000),
    (sqft: 2000, price: 450000),
    (sqft: 2500, price: 550000)
};

// Simple linear regression
double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
foreach (var (x, y) in data) {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
}

double slope = (data.Length * sumXY - sumX * sumY) / (data.Length * sumX2 - sumX * sumX);
double intercept = (sumY - slope * sumX) / data.Length;

Console.WriteLine($"Price = {slope:F2} * sqft + {intercept:F0}");`,
                    java: `// Simple linear regression
double[] sqft = {1000, 1500, 2000, 2500};
double[] prices = {250000, 350000, 450000, 550000};

double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
for (int i = 0; i < sqft.length; i++) {
    sumX += sqft[i];
    sumY += prices[i];
    sumXY += sqft[i] * prices[i];
    sumX2 += sqft[i] * sqft[i];
}

double slope = (sqft.length * sumXY - sumX * sumY) / (sqft.length * sumX2 - sumX * sumX);`,
                    javascript: `// Linear regression: house prices
const data = [
    {sqft: 1000, price: 250000},
    {sqft: 1500, price: 350000},
    {sqft: 2000, price: 450000},
    {sqft: 2500, price: 550000}
];

const n = data.length;
let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

data.forEach(d => {
    sumX += d.sqft;
    sumY += d.price;
    sumXY += d.sqft * d.price;
    sumX2 += d.sqft * d.sqft;
});

const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
const intercept = (sumY - slope * sumX) / n;

console.log(\`Price = \${slope}*sqft + \${intercept}\`);`,
                },
            },
            {
                title: "Decision trees",
                description: `Decision trees recursively split data based on feature values to make predictions. Each node tests a feature (e.g., "age > 30?"), creating left and right branches. Leaf nodes contain predictions. The tree learns which features and thresholds split data most effectively.

Information gain measures how much a split reduces uncertainty. Before split, data is mixed (high entropy). After split, hopefully each branch is purer (low entropy). Choose the split that maximizes information gain. This greedy approach builds trees top-down.

Decision trees are interpretable: you can trace the path from root to leaf to understand why a prediction was made. Useful for feature importance analysis—frequent splits on a feature indicate its importance.

Limitations: prone to overfitting, especially with deep trees. Preventing overfitting requires pruning (removing branches) or limiting tree depth. Ensemble methods (random forests, gradient boosting) use multiple trees to improve accuracy and robustness.

Real applications: medical diagnosis (diseases have branching patterns), loan approval (credit history, income, debt), customer segmentation.`,
                bullets: [
                    "Recursive splitting on features creates tree structure",
                    "Information gain selects splits that reduce entropy/impurity",
                    "Leaf nodes contain predictions (class or value)",
                    "Interpretable: trace path to understand predictions",
                    "Overfitting: prune or limit depth; use ensembles",
                ],
                exampleTitle: "Building a decision tree for customer churn prediction",
                examples: {
                    python: `from sklearn.tree import DecisionTreeClassifier
import pandas as pd

# Customer data
data = pd.DataFrame({
    'age': [25, 35, 45, 55, 28, 38],
    'contract_months': [12, 24, 12, 6, 24, 12],
    'churned': [1, 0, 0, 1, 0, 1]
})

X = data[['age', 'contract_months']]
y = data['churned']

# Train tree
tree = DecisionTreeClassifier(max_depth=3)
tree.fit(X, y)

# Predict
prediction = tree.predict([[32, 6]])
print(f"Will customer churn? {prediction[0]}")

# Feature importance
print(tree.feature_importances_)`,
                    csharp: `// Decision tree structure
class TreeNode {
    public string? FeatureName { get; set; }
    public double Threshold { get; set; }
    public int? Prediction { get; set; }  // Leaf node
    public TreeNode? Left { get; set; }
    public TreeNode? Right { get; set; }
}`,
                    java: `// Simplified decision tree for categorization
class DecisionTree {
    private TreeNode root;
    
    public int predict(double[] features) {
        TreeNode current = root;
        while (current != null) {
            if (current.isLeaf()) return current.prediction;
            
            if (features[current.featureIndex] < current.threshold) {
                current = current.left;
            } else {
                current = current.right;
            }
        }
        return -1;
    }
}`,
                    javascript: `// Decision tree node structure
class TreeNode {
    constructor(featureIndex = null, threshold = null, prediction = null) {
        this.featureIndex = featureIndex;
        this.threshold = threshold;
        this.prediction = prediction;
        this.left = null;
        this.right = null;
    }
    
    predict(features) {
        if (this.prediction !== null) return this.prediction;
        
        if (features[this.featureIndex] < this.threshold) {
            return this.left.predict(features);
        } else {
            return this.right.predict(features);
        }
    }
}`,
                },
            },
            {
                title: "Clustering and unsupervised learning",
                description: `Clustering groups similar data points together without labeled targets. Unlike supervised learning, there's no "right answer"—you're discovering structure. Applications: customer segmentation, document grouping, anomaly detection, image compression.

K-means is the most popular algorithm. Choose k (number of clusters), randomly initialize k centroids, assign points to nearest centroid, move centroids to mean of assigned points, repeat until convergence. Fast and scalable but requires choosing k beforehand.

Hierarchical clustering creates a tree of clusters. Start with each point as its own cluster, repeatedly merge the closest pair until one cluster remains. Produces a dendrogram showing clustering at different levels of granularity.

Evaluating clustering is harder than supervised learning because there's no ground truth. Silhouette score measures cohesion (points within cluster are similar) and separation (clusters are different). Elbow method for choosing k: plot inertia vs k, look for the "elbow."

Real use case: e-commerce customer segmentation reveals high-value customers (frequent purchasers), dormant users (haven't purchased recently), window shoppers (browse but rarely buy). Target each segment differently.`,
                bullets: [
                    "Unsupervised: discover patterns without labeled data",
                    "K-means: partition into k clusters minimizing intra-cluster distance",
                    "Hierarchical: tree of clusters at varying granularity",
                    "Silhouette score: evaluate cohesion and separation",
                    "Elbow method: choose k by plotting inertia",
                ],
                exampleTitle: "Segmenting customers with K-means clustering",
                examples: {
                    python: `from sklearn.cluster import KMeans
import numpy as np

# Customer data: spending and frequency
X = np.array([
    [100, 2],   # low spend, low frequency
    [5000, 50], # high spend, high frequency
    [150, 3],
    [4500, 45],
    [50, 1],
    [6000, 60]
])

# Cluster into 3 segments
kmeans = KMeans(n_clusters=3, random_state=42)
clusters = kmeans.fit_predict(X)

print(f"Customer segments: {clusters}")
print(f"Cluster centers: {kmeans.cluster_centers_}")`,
                    csharp: `class KMeansClusterer {
    public int[] Cluster(double[][] data, int k) {
        var centroids = InitializeCentroids(data, k);
        int[] assignments = new int[data.Length];
        bool converged = false;
        
        while (!converged) {
            // Assign points to nearest centroid
            for (int i = 0; i < data.Length; i++) {
                double minDist = double.MaxValue;
                for (int j = 0; j < k; j++) {
                    double dist = Distance(data[i], centroids[j]);
                    if (dist < minDist) {
                        minDist = dist;
                        assignments[i] = j;
                    }
                }
            }
            
            // Update centroids
            converged = UpdateCentroids(data, assignments, centroids);
        }
        
        return assignments;
    }
}`,
                    java: `double[] distances = new double[k];
for (int j = 0; j < k; j++) {
    distances[j] = euclideanDistance(point, centroids[j]);
}
int nearestCluster = findMin(distances);`,
                    javascript: `function kMeans(data, k, iterations = 100) {
    let centroids = data.slice(0, k);
    let assignments = new Array(data.length);
    
    for (let iter = 0; iter < iterations; iter++) {
        // Assign points to nearest centroid
        for (let i = 0; i < data.length; i++) {
            let minDist = Infinity;
            for (let j = 0; j < k; j++) {
                const dist = euclideanDistance(data[i], centroids[j]);
                if (dist < minDist) {
                    minDist = dist;
                    assignments[i] = j;
                }
            }
        }
        
        // Update centroids
        centroids = recalculateCentroids(data, assignments, k);
    }
    
    return assignments;
}`,
                },
            },
            {
                title: "Dimensionality reduction",
                description: `High-dimensional data (many features) is hard to visualize, computationally expensive, and prone to overfitting. Dimensionality reduction compresses data while retaining important information. Applications: data visualization, noise reduction, speeding up training.

Principal Component Analysis (PCA) finds directions of maximum variance. Project data onto fewer axes (principal components) that capture most variance. Linear approach—assumes data variance reveals importance.

t-SNE is powerful for visualization. Converts high-dimensional distances to low-dimensional probabilities, creating 2D/3D plots that reveal clusters. Unlike PCA, nonlinear—captures complex patterns. Often used to visualize neural network embeddings.

Feature selection removes irrelevant features: correlation with target variable, mutual information, recursive elimination. Simpler models train faster and generalize better when irrelevant features are removed.

Real application: image compression. Images have millions of pixels. PCA identifies principal patterns (edges, textures), projects to fewer dimensions, reconstructs approximately. Not perfect but dramatically smaller.`,
                bullets: [
                    "Reduce features while preserving information",
                    "PCA: linear, finds max variance directions",
                    "t-SNE: nonlinear, excellent for visualization",
                    "Feature selection: remove irrelevant features",
                    "Applications: visualization, compression, speedup",
                ],
                exampleTitle: "Visualizing high-dimensional data with t-SNE",
                examples: {
                    python: `from sklearn.manifold import TSNE
from sklearn.datasets import load_digits
import matplotlib.pyplot as plt

# High-dimensional data (64 features per digit)
digits = load_digits()
X = digits.data  # (1797, 64)

# Reduce to 2D for visualization
tsne = TSNE(n_components=2, random_state=42)
X_2d = tsne.fit_transform(X)

# Plot
plt.scatter(X_2d[:, 0], X_2d[:, 1], c=digits.target, cmap='tab10')
plt.title('t-SNE: Handwritten Digits')
plt.show()`,
                    csharp: `// PCA for dimensionality reduction
double[][] CovarianceMatrix(double[][] data) {
    int features = data[0].Length;
    double[][] cov = new double[features][];
    
    // Calculate centered data
    double[] mean = new double[features];
    foreach (var row in data) {
        for (int i = 0; i < features; i++) {
            mean[i] += row[i];
        }
    }
    for (int i = 0; i < features; i++) {
        mean[i] /= data.Length;
    }
    
    // Covariance computation...
    return cov;
}`,
                    java: `// Dimension reduction via PCA
Matrix data = new Matrix(features, numSamples);
Matrix covariance = data.times(data.transpose()).times(1.0 / numSamples);

// Eigenvalue decomposition
EigenvalueDecomposition evd = new EigenvalueDecomposition(covariance);
Matrix components = evd.getV();

// Project onto k dimensions
Matrix projected = components.getMatrix(0, features-1, 0, k-1).transpose().times(data);`,
                    javascript: `// Simple PCA projection
function pca(data, k) {
    // Center data
    const mean = data[0].map((_, i) => 
        data.reduce((sum, row) => sum + row[i], 0) / data.length
    );
    
    const centered = data.map(row => 
        row.map((val, i) => val - mean[i])
    );
    
    // Compute covariance (simplified)
    // In practice, use libraries like ml.js or TensorFlow
    return centered;
}`,
                },
            },
        ],
    },
    {
        id: "webdev",
        title: "Web Dev",
        eyebrow: "Building scalable web applications",
        summary: "Master HTTP, routing, authentication, databases, and deployment strategies.",
        chips: ["Full-stack development", "API design", "Backend architecture"],
        sections: [
            {
                title: "HTTP methods and status codes",
                description: `HTTP (Hypertext Transfer Protocol) is the foundation of the web. Every request from your browser or app to a server uses HTTP. Understanding HTTP correctly is essential for web development.

HTTP methods define the action you're performing: GET retrieves data without modifying state (safe operation), POST creates new resources, PUT replaces entire resources, DELETE removes resources, PATCH applies partial updates. RESTful API design uses these methods correctly—GET for safe reads, POST for creation, PUT for replacement, DELETE for removal.

Status codes tell the client what happened. 2xx codes mean success: 200 OK (request succeeded), 201 Created (resource was created), 204 No Content (success but empty response body). 3xx codes redirect: 301 Moved Permanently, 302 Found (temporary redirect). 4xx codes indicate client errors: 400 Bad Request (malformed input), 401 Unauthorized (authentication required), 403 Forbidden (authenticated but not authorized), 404 Not Found. 5xx codes are server errors: 500 Internal Server Error, 503 Service Unavailable.

Using correct status codes matters. Clients depend on them for proper error handling. APIs use status codes to determine retry logic: 4xx means don't retry (it's the client's fault), 5xx means retry with exponential backoff (server might recover). Returning 200 for an actual error breaks automated tooling and makes debugging nearly impossible.

HTTP is stateless: each request is independent. The server doesn't inherently remember previous requests. Maintaining state requires sessions (cookies) or tokens (like JWTs) sent with each request. Understanding this statelessness is key to designing scalable systems.`,
                bullets: [
                    "GET retrieves; POST creates; PUT replaces; DELETE removes; PATCH partially updates",
                    "2xx: success; 3xx: redirect; 4xx: client error; 5xx: server error",
                    "Correct status codes enable proper error handling and automatic retries",
                    "HTTP is stateless—state must be maintained via sessions or tokens",
                    "REST design uses HTTP methods and codes idiomatically",
                ],
                exampleTitle: "Building a user API with proper methods and status codes",
                examples: {
                    python: `# Flask: Build API with correct HTTP methods
from flask import Flask, jsonify, request

app = Flask(__name__)
users = {"1": {"id": 1, "name": "Alice"}, "2": {"id": 2, "name": "Bob"}}

@app.route('/users', methods=['GET'])
def get_all_users():
    # GET: retrieve all users
    return jsonify(list(users.values())), 200

@app.route('/users', methods=['POST'])
def create_user():
    # POST: create new user
    data = request.json
    if not data or 'name' not in data:
        return jsonify({"error": "Name required"}), 400
    
    new_id = str(max(int(k) for k in users.keys()) + 1)
    user = {"id": int(new_id), "name": data['name']}
    users[new_id] = user
    return jsonify(user), 201

@app.route('/users/<id>', methods=['GET'])
def get_user(id):
    if id not in users:
        return jsonify({"error": "Not found"}), 404
    return jsonify(users[id]), 200

@app.route('/users/<id>', methods=['DELETE'])
def delete_user(id):
    if id not in users:
        return jsonify({"error": "Not found"}), 404
    del users[id]
    return '', 204`,
                    csharp: `// ASP.NET Core: RESTful API
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase {
    private static Dictionary<int, User> users = new() {
        {1, new User {Id = 1, Name = "Alice"}},
        {2, new User {Id = 2, Name = "Bob"}}
    };
    
    [HttpGet]
    public ActionResult<IEnumerable<User>> GetAll() {
        return Ok(users.Values);  // 200
    }
    
    [HttpPost]
    public ActionResult<User> Create([FromBody] UserDto dto) {
        if (string.IsNullOrEmpty(dto.Name)) {
            return BadRequest("Name required");  // 400
        }
        
        var user = new User { Id = users.Count + 1, Name = dto.Name };
        users[user.Id] = user;
        return CreatedAtAction(nameof(Get), new { id = user.Id }, user);  // 201
    }
    
    [HttpGet("{id}")]
    public ActionResult<User> Get(int id) {
        if (!users.TryGetValue(id, out var user)) {
            return NotFound();  // 404
        }
        return Ok(user);  // 200
    }
    
    [HttpDelete("{id}")]
    public IActionResult Delete(int id) {
        if (!users.ContainsKey(id)) {
            return NotFound();  // 404
        }
        users.Remove(id);
        return NoContent();  // 204
    }
}`,
                    java: `// Spring Boot: RESTful controller
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private static Map<Integer, User> users = new HashMap<>();
    static {
        users.put(1, new User(1, "Alice"));
        users.put(2, new User(2, "Bob"));
    }
    
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(users.values());  // 200
    }
    
    @PostMapping
    public ResponseEntity<?> create(@RequestBody UserDto dto) {
        if (dto.getName() == null || dto.getName().isEmpty()) {
            return ResponseEntity.badRequest().body("Name required");  // 400
        }
        
        User user = new User(users.size() + 1, dto.getName());
        users.put(user.getId(), user);
        return ResponseEntity.status(201).body(user);  // 201
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable int id) {
        return users.containsKey(id) 
            ? ResponseEntity.ok(users.get(id))  // 200
            : ResponseEntity.notFound().build();  // 404
    }
}`,
                    javascript: `// Express.js: Build RESTful API
const express = require('express');
const app = express();
app.use(express.json());

let users = {
    "1": {id: 1, name: "Alice"},
    "2": {id: 2, name: "Bob"}
};

// GET all users
app.get('/users', (req, res) => {
    res.status(200).json(Object.values(users));
});

// POST create user
app.post('/users', (req, res) => {
    const {name} = req.body;
    if (!name) {
        return res.status(400).json({error: "Name required"});
    }
    
    const newId = String(Math.max(...Object.keys(users).map(Number)) + 1);
    const user = {id: Number(newId), name};
    users[newId] = user;
    res.status(201).json(user);
});

// GET specific user
app.get('/users/:id', (req, res) => {
    if (!users[req.params.id]) {
        return res.status(404).json({error: "Not found"});
    }
    res.status(200).json(users[req.params.id]);
});

// DELETE user
app.delete('/users/:id', (req, res) => {
    if (!users[req.params.id]) {
        return res.status(404).json({error: "Not found"});
    }
    delete users[req.params.id];
    res.status(204).send();
});`,
                },
            },
            {
                title: "Routing and middleware",
                description: `Routing maps URLs to handlers. Middleware processes requests before handlers, enabling cross-cutting concerns like logging, authentication, and body parsing.

Route patterns: /users (exact), /users/:id (parameter), /api/v1/* (wildcard). Middleware chains: request → middleware1 → middleware2 → handler → middleware response processing.

Middleware order matters. Request flows top to bottom. If middleware doesn't call next(), the chain stops. This enables request rejection before reaching handlers.

Common middleware: body parser (parse JSON), logger (log requests), authentication (verify credentials), CORS (allow cross-origin), error handler (catch errors).

Router organization: group related routes together. /api/users routes separate from /api/products, each with its own middleware.`,
                bullets: [
                    "Routes map URLs to handler functions",
                    "Route patterns: exact, parameters (:id), wildcards",
                    "Middleware executes before/after handlers",
                    "Middleware order matters; left to right execution",
                    "Use for logging, auth, body parsing, CORS",
                ],
                exampleTitle: "Setting up API with routing and middleware",
                examples: {
                    python: `from flask import Flask, request
app = Flask(__name__)

# Middleware: log requests
@app.before_request
def log_request():
    print(f"{request.method} {request.path}")

# Route group
@app.route('/api/users', methods=['GET'])
def get_users(): return {"users": []}

@app.route('/api/users', methods=['POST'])
def create_user(): return {"id": 1}, 201`,
                    csharp: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Middleware
app.Use(async (context, next) => {
    Console.WriteLine($"{context.Request.Method} {context.Request.Path}");
    await next();
});

app.MapGet("/api/users", () => new { users = new object[0] });
app.MapPost("/api/users", () => "Created");`,
                    java: `@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Bean
    public HandlerInterceptor loggingInterceptor() {
        return new HandlerInterceptor() {
            public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
                System.out.println(req.getMethod() + " " + req.getRequestURI());
                return true;
            }
        };
    }
}`,
                    javascript: `const express = require('express');
const app = express();

// Middleware
app.use((req, res, next) => {
    console.log(\`\${req.method} \${req.path}\`);
    next();
});

app.get('/api/users', (req, res) => res.json({users: []}));
app.post('/api/users', (req, res) => res.status(201).json({id: 1}));`,
                },
            },
            {
                title: "Request parsing and validation",
                description: `HTTP requests contain data in query strings, URL paths, headers, and body. Parsing extracts this data; validation ensures it's correct before processing.

Query strings: ?sort=name&limit=10. URL parameters: /users/123. Headers: Authorization, Content-Type. Body: POST/PUT data (JSON, form-encoded).

Validation prevents bugs and security issues. Empty name, negative numbers, malformed dates—all should be caught early. Validate on server-side always; client validation is only UX convenience.

Common validation: required fields, type checking, range validation, pattern matching (regex for emails), length limits. Return 400 Bad Request with error details if validation fails.

Security: sanitize inputs to prevent injection attacks. Never trust client data.`,
                bullets: [
                    "Parse query strings, URL params, headers, body",
                    "Validate before processing: required, type, range, pattern",
                    "Return 400 Bad Request with error details",
                    "Server-side validation always required",
                    "Sanitize inputs to prevent injection attacks",
                ],
                exampleTitle: "Parsing and validating user registration",
                examples: {
                    python: `from flask import request, jsonify
import re

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    
    # Validation
    if not data or 'email' not in data:
        return jsonify({"error": "Email required"}), 400
    
    if not re.match(r"[^@]+@[^@]+\.[^@]+", data['email']):
        return jsonify({"error": "Invalid email"}), 400
    
    if len(data.get('password', '')) < 8:
        return jsonify({"error": "Password too short"}), 400
    
    return jsonify({"status": "ok"}), 201`,
                    csharp: `[HttpPost("register")]
public ActionResult Register([FromBody] RegisterDto dto) {
    if (!ModelState.IsValid) return BadRequest(ModelState);
    
    var email = dto.Email?.Trim();
    if (string.IsNullOrEmpty(email)) return BadRequest("Email required");
    
    if (!Regex.IsMatch(email, @"[^@]+@[^@]+\.[^@]+"))
        return BadRequest("Invalid email");
    
    return Ok();
}`,
                    java: `@PostMapping("/register")
public ResponseEntity<?> register(@RequestBody RegisterDto dto) {
    String email = dto.getEmail();
    if (email == null || email.isEmpty())
        return ResponseEntity.badRequest().body("Email required");
    
    if (!email.matches("[^@]+@[^@]+\\.[^@]+"))
        return ResponseEntity.badRequest().body("Invalid email");
    
    return ResponseEntity.ok("Registered");
}`,
                    javascript: `app.post('/register', (req, res) => {
    const {email, password} = req.body;
    
    if (!email) return res.status(400).json({error: "Email required"});
    if (!/[^@]+@[^@]+\.[^@]+/.test(email)) 
        return res.status(400).json({error: "Invalid email"});
    if (!password || password.length < 8)
        return res.status(400).json({error: "Password too short"});
    
    res.status(201).json({status: "ok"});
});`,
                },
            },
            {
                title: "Authentication and JWTs",
                description: `HTTP is stateless. When a client logs in, the server needs to remember this on subsequent requests. There are two approaches: sessions (server-side) and tokens (client-side).

Sessions: server stores session data, sends session ID in cookie. Client includes cookie in requests. Pro: server controls everything. Con: doesn't scale across servers.

Tokens (JWTs): server creates signed token containing user info. Client stores token locally, includes in request header. Server verifies signature without storing. Pro: scales horizontally. Con: can't revoke instantly.

JWT structure: header.payload.signature. Header specifies algorithm. Payload contains claims (user ID, roles). Signature proves tampering hasn't occurred.

Authentication flow: 1) client sends credentials, 2) server verifies, 3) server issues token/sets session, 4) client includes token/session in future requests.`,
                bullets: [
                    "Sessions: server-side state, cookie-based",
                    "Tokens (JWTs): client-side, header-based",
                    "JWT structure: header.payload.signature",
                    "Sessions: control, doesn't scale. Tokens: scalable, harder to revoke",
                    "Always use HTTPS to protect credentials/tokens",
                ],
                exampleTitle: "Implementing JWT authentication",
                examples: {
                    python: `import jwt
from datetime import datetime, timedelta

# Issue token
def issue_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, 'secret', algorithm='HS256')

# Verify token
def verify_token(token):
    try:
        payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        return payload['user_id']
    except:
        return None`,
                    csharp: `var token = new JwtSecurityTokenHandler().CreateToken(
    new SecurityTokenDescriptor {
        Subject = new ClaimsIdentity(new[] {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
        }),
        Expires = DateTime.UtcNow.AddHours(1),
        SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
    });`,
                    java: `String token = Jwts.builder()
    .setSubject(user.getId().toString())
    .setIssuedAt(new Date())
    .setExpiration(new Date(System.currentTimeMillis() + 3600000))
    .signWith(SignatureAlgorithm.HS256, "secret".getBytes())
    .compact();`,
                    javascript: `const jwt = require('jsonwebtoken');

const token = jwt.sign({userId: 1}, 'secret', {expiresIn: '1h'});
const decoded = jwt.verify(token, 'secret');`,
                },
            },
            {
                title: "Database basics and SQL",
                description: `Databases store structured data persistently. SQL (Structured Query Language) is the standard language for relational databases. A relational database organizes data into tables with rows (records) and columns (fields).

Tables have relationships. Foreign keys link tables: a users table has many orders, each order row contains a user_id linking to the users table. Joins combine data from multiple tables: SELECT orders.* FROM orders JOIN users ON orders.user_id = users.id.

ACID properties ensure data integrity: Atomicity (all-or-nothing), Consistency (valid state), Isolation (concurrent safety), Durability (permanent). Transactions group operations; if any fails, all roll back.

Indexes speed searches. An index on user_id makes lookups O(log n) instead of O(n). Cost: indexes require memory and slow writes slightly since index must update.

NoSQL databases (MongoDB, Firebase) store flexible documents instead of rigid tables. Better for rapidly evolving schemas but lose some consistency guarantees.

Real example: e-commerce. Products table, Orders table (links to Products and Users), OrderItems table (each item in an order). Queries find all items in an order, products ordered by user, total revenue by product.`,
                bullets: [
                    "Tables: rows are records, columns are fields",
                    "Foreign keys: link tables, enforce relationships",
                    "Joins: combine data from multiple tables",
                    "Indexes: speed searches at cost of write speed and memory",
                    "ACID: guarantees data integrity in transactions",
                ],
                exampleTitle: "Building an e-commerce database with SQL",
                examples: {
                    python: `import sqlite3

conn = sqlite3.connect('ecommerce.db')
cursor = conn.cursor()

# Create tables
cursor.execute("""
    CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE
    )
""")

cursor.execute("""
    CREATE TABLE orders (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        total REAL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
""")

# Insert data
cursor.execute("INSERT INTO users VALUES (1, 'Alice', 'alice@example.com')")
cursor.execute("INSERT INTO orders VALUES (1, 1, 99.99)")
conn.commit()

# Query: Find all orders by Alice
cursor.execute("""
    SELECT orders.id, orders.total
    FROM orders
    JOIN users ON orders.user_id = users.id
    WHERE users.name = 'Alice'
""")
print(cursor.fetchall())`,
                    csharp: `using (var connection = new SqlConnection(connectionString)) {
    connection.Open();
    
    // Create user
    var command = new SqlCommand(
        "INSERT INTO users (name, email) VALUES (@name, @email)",
        connection
    );
    command.Parameters.AddWithValue("@name", "Alice");
    command.Parameters.AddWithValue("@email", "alice@example.com");
    command.ExecuteNonQuery();
    
    // Query: User's orders
    var queryCmd = new SqlCommand(
        @"SELECT o.id, o.total FROM orders o
          JOIN users u ON o.user_id = u.id
          WHERE u.name = @name",
        connection
    );
    queryCmd.Parameters.AddWithValue("@name", "Alice");
    
    var reader = queryCmd.ExecuteReader();
    while (reader.Read()) {
        Console.WriteLine(\$"Order {reader[0]}: \${reader[1]}\");
    }
}`,
                    java: `Connection conn = DriverManager.getConnection(url, user, password);

String sql = "SELECT id, total FROM orders WHERE user_id = ?";
PreparedStatement stmt = conn.prepareStatement(sql);
stmt.setInt(1, userId);

ResultSet rs = stmt.executeQuery();
while (rs.next()) {
    System.out.println("Order: " + rs.getInt("id"));
}`,
                    javascript: `const mysql = require('mysql2/promise');

const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'ecommerce'
});

// Insert
await connection.execute(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    ['Alice', 'alice@example.com']
);

// Query
const [rows] = await connection.execute(
    \`SELECT id, total FROM orders WHERE user_id = ?\`,
    [userId]
);`,
                },
            },
            {
                title: "Caching strategies",
                description: `Caching stores frequently accessed data in fast storage to avoid recomputation or database queries. Applications: web page caching, API response caching, computation result caching.

Client-side caching stores on user's browser. HTTP headers (Cache-Control, ETag) tell browser how long to cache. Browser makes subsequent requests to cached resources instantly. Reduces server load and improves perceived performance.

Server-side caching stores on server or in-memory store (Redis, Memcached). Database query results often cached. Application-level cache avoids expensive computations. Key-value stores enable fast retrieval.

Cache invalidation is the hard part. When data changes, stale cache causes inconsistency. Strategies: time-based expiration (cache for X minutes), event-based invalidation (clear cache when data updates), versioning (store multiple versions).

Cache hit ratio measures effectiveness. High ratio means cache strategy works; low ratio wastes memory. Monitor hit rates to tune cache sizing and expiration.

Real scenario: blog with expensive trending posts computation. Cache result for 1 hour. When user requests, serve cached result or recompute if expired. Comments invalidate cache immediately since data changed.`,
                bullets: [
                    "Client-side: browser caching via HTTP headers",
                    "Server-side: in-memory stores (Redis, Memcached)",
                    "Cache-Control: specify expiration and revalidation",
                    "Invalidation: time-based, event-based, or versioning",
                    "Monitor: track hit ratios to tune strategy",
                ],
                exampleTitle: "Implementing Redis caching for database queries",
                examples: {
                    python: `import redis
import json

redis_client = redis.Redis(host='localhost', port=6379)

def get_user(user_id):
    # Check cache first
    cache_key = f"user:{user_id}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Cache miss: query database
    user = database.query(f"SELECT * FROM users WHERE id = {user_id}")
    
    # Store in cache (expire after 1 hour)
    redis_client.setex(cache_key, 3600, json.dumps(user))
    return user`,
                    csharp: `public async Task<User> GetUserAsync(int userId) {
    string cacheKey = \$"user:{userId}\";
    
    // Try cache
    var cached = await _cache.GetStringAsync(cacheKey);
    if (!string.IsNullOrEmpty(cached)) {
        return JsonSerializer.Deserialize<User>(cached);
    }
    
    // Cache miss: query database
    var user = await _db.Users.FindAsync(userId);
    
    // Store in cache
    var options = new DistributedCacheEntryOptions()
        .SetAbsoluteExpiration(TimeSpan.FromHours(1));
    await _cache.SetStringAsync(cacheKey, 
        JsonSerializer.Serialize(user), options);
    
    return user;
}`,
                    java: `public User getUser(int userId) {
    String cacheKey = "user:" + userId;
    
    // Check Memcached
    Object cached = memcachedClient.get(cacheKey);
    if (cached != null) return (User) cached;
    
    // Database query
    User user = userRepository.findById(userId);
    
    // Cache for 1 hour
    memcachedClient.set(cacheKey, 3600, user);
    
    return user;
}`,
                    javascript: `const redis = require('redis');
const client = redis.createClient();

async function getUser(userId) {
    const cacheKey = \`user:\${userId}\`;
    
    // Check cache
    const cached = await client.get(cacheKey);
    if (cached) return JSON.parse(cached);
    
    // Database query
    const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    // Cache for 1 hour
    await client.setEx(cacheKey, 3600, JSON.stringify(user));
    
    return user;
}`,
                },
            },
            {
                title: "Error handling and logging",
                description: `Errors happen—network failures, invalid input, server crashes. Good error handling prevents silent failures and enables debugging.

HTTP status codes communicate errors: 400 Bad Request (client error), 404 Not Found, 500 Internal Server Error (server error). Return appropriate codes plus error details for client handling.

Try-catch blocks catch exceptions. Re-throw with context or return error response. Never swallow errors silently; always log them. Log stack traces so you can debug post-mortem.

Logging records events: requests, errors, state changes. Different levels: debug (verbose), info (normal), warn (concerning), error (problem). Structured logging includes timestamps, request IDs, user IDs—enables filtering and searching.

Graceful degradation: when service degrades, handle it. Database down? Cache responses. Feature unavailable? Tell user instead of crashing. Circuit breaker pattern: if dependency fails repeatedly, stop calling it temporarily.

Real scenario: payment processing fails temporarily. Don't crash; queue the order and retry. Log the failure with order ID. Notify customer of pending status. Admin dashboard shows queued orders for manual review.`,
                bullets: [
                    "HTTP status codes: communicate success/failure to clients",
                    "Try-catch: catch and handle exceptions with context",
                    "Logging: debug, info, warn, error levels",
                    "Structured logs: include timestamps, IDs, traces",
                    "Graceful degradation: handle failures without crashing",
                ],
                exampleTitle: "Implementing error handling and logging",
                examples: {
                    python: `import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.route('/process-payment', methods=['POST'])
def process_payment():
    try:
        data = request.json
        logger.info(f"Processing payment for order {data['order_id']}")
        
        # Validate
        if not data.get('amount'):
            logger.warning(f"Invalid amount for order {data['order_id']}")
            return jsonify({"error": "Amount required"}), 400
        
        # Process
        result = payment_gateway.charge(data['amount'])
        logger.info(f"Payment success: {result['id']}")
        return jsonify({"status": "ok"}), 200
        
    except PaymentError as e:
        logger.error(f"Payment failed: {str(e)}", exc_info=True)
        return jsonify({"error": "Payment failed"}), 500
    except Exception as e:
        logger.exception(f"Unexpected error: {str(e)}")
        return jsonify({"error": "Server error"}), 500`,
                    csharp: `public class ErrorHandlingMiddleware {
    private readonly ILogger<ErrorHandlingMiddleware> _logger;
    
    public async Task Invoke(HttpContext context) {
        try {
            await _next(context);
        } catch (Exception ex) {
            _logger.LogError(ex, "Unhandled exception");
            
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            
            await context.Response.WriteAsJsonAsync(new {
                error = "Internal server error",
                traceId = context.TraceIdentifier
            });
        }
    }
}`,
                    java: `@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    @ExceptionHandler(PaymentException.class)
    public ResponseEntity<?> handlePaymentError(PaymentException ex) {
        logger.error("Payment failed", ex);
        return ResponseEntity.status(500)
            .body(new ErrorResponse("Payment processing failed"));
    }
}`,
                    javascript: `app.use((err, req, res, next) => {
    logger.error(\`Error: \${err.message}\`, {
        stack: err.stack,
        path: req.path,
        method: req.method,
        userId: req.user?.id
    });
    
    const status = err.status || 500;
    const message = err.message || 'Server error';
    
    res.status(status).json({
        error: message,
        traceId: req.id
    });
});`,
                },
            },
            {
                title: "Rate limiting and throttling",
                description: `Rate limiting restricts request frequency to prevent abuse, DoS attacks, and resource exhaustion. Strategies: limit per IP, per user, per API key.

Token bucket algorithm: maintain a bucket of tokens. Each request costs a token. Tokens refill at fixed rate. If bucket empty, reject request. Allows burst traffic (if tokens accumulated) while limiting average rate.

Sliding window: track timestamps of recent requests. Calculate if new request exceeds limit. Simple but requires storing timestamps; memory cost scales with request rate.

HTTP 429 Too Many Requests status code tells clients to back off. Clients should respect Retry-After header indicating when to retry.

Implementation: middleware before handler, or in database layer. Redis efficient for distributed systems—shared counter across servers.

Real application: public API allows 1000 requests per hour per key. Malicious client making 10k requests/hour gets throttled. Legitimate client with burst traffic (e.g., data import) can use temporary high limit with premium tier.`,
                bullets: [
                    "Token bucket: accumulate tokens, cost per request",
                    "Sliding window: track recent request timestamps",
                    "HTTP 429: Too Many Requests status",
                    "Retry-After: header indicates backoff time",
                    "Distributed: use Redis for multi-server coordination",
                ],
                exampleTitle: "Implementing token bucket rate limiting",
                examples: {
                    python: `from flask_limiter import Limiter

limiter = Limiter(key_func=lambda: request.remote_addr)

@app.route('/api/data', methods=['GET'])
@limiter.limit("100 per hour")
def get_data():
    return jsonify({"data": "..."})

# Or custom implementation
import time

class RateLimiter:
    def __init__(self, rate: int, per: int):
        self.rate = rate  # requests
        self.per = per    # seconds
        self.tokens = {}
    
    def is_allowed(self, client_id: str) -> bool:
        now = time.time()
        if client_id not in self.tokens:
            self.tokens[client_id] = [now]
            return True
        
        # Remove old requests
        self.tokens[client_id] = [
            t for t in self.tokens[client_id] 
            if now - t < self.per
        ]
        
        if len(self.tokens[client_id]) < self.rate:
            self.tokens[client_id].append(now)
            return True
        
        return False`,
                    csharp: `public class RateLimitMiddleware {
    private readonly IDistributedCache _cache;
    
    public async Task Invoke(HttpContext context) {
        var clientId = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var key = \$"rate_limit:{clientId}\";
        
        var count = await _cache.GetAsync(key);
        int requestCount = count == null ? 0 : int.Parse(Encoding.UTF8.GetString(count));
        
        if (requestCount > 100) {
            context.Response.StatusCode = 429;
            await context.Response.WriteAsync("Too many requests");
            return;
        }
        
        requestCount++;
        var options = new DistributedCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromHours(1));
        await _cache.SetAsync(key, 
            Encoding.UTF8.GetBytes(requestCount.ToString()), options);
        
        await _next(context);
    }
}`,
                    java: `@Component
public class RateLimitFilter implements Filter {
    @Autowired
    private RedisTemplate<String, Integer> redisTemplate;
    
    public void doFilter(ServletRequest request, ServletResponse response, 
                         FilterChain chain) throws IOException, ServletException {
        String clientId = ((HttpServletRequest) request).getRemoteAddr();
        String key = "ratelimit:" + clientId;
        
        Integer count = redisTemplate.opsForValue().get(key);
        if (count != null && count > 100) {
            ((HttpServletResponse) response).setStatus(429);
            return;
        }
        
        redisTemplate.opsForValue().increment(key);
        redisTemplate.expire(key, 1, TimeUnit.HOURS);
        
        chain.doFilter(request, response);
    }
}`,
                    javascript: `const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,  // 1 hour
    max: 100,                   // 100 requests
    message: 'Too many requests',
    statusCode: 429
});

app.get('/api/data', limiter, (req, res) => {
    res.json({data: '...'});
});`,
                },
            },
        ],
    },
    {
        id: "gamedev",
        title: "Game Dev",
        eyebrow: "Creating interactive experiences",
        summary:
            "Learn game loops, physics, collision, animation, and real-time rendering fundamentals.",
        chips: ["Interactive systems", "Real-time graphics", "Player experience"],
        sections: [
            {
                title: "Game loop fundamentals",
                description: `Every game runs a game loop: a continuous cycle that repeatedly processes input, updates game state, and renders the screen. This loop runs dozens to hundreds of times per second (typically 60 FPS or 144 FPS), creating the illusion of smooth, continuous motion.

The typical game loop has three core phases. First, input processing: check keyboard, mouse, gamepad states and determine player intent. Second, logic update: move entities, apply physics, check collisions, update AI, apply effects. Third, rendering: draw everything to the screen based on current game state.

Timing is absolutely critical. With a fixed timestep approach, you advance simulation by a fixed amount each frame (e.g., 1/60th of a second), then render. This decouples game logic from display framerate. Your game plays consistently whether someone runs it at 30 FPS or 120 FPS.

Delta time is the elapsed time since the last frame. Use it to scale motion so it's framerate-independent. Common mistake: position += velocity. This breaks on different framerates. Fix: position += velocity * deltaTime. Now movement is per-second, not per-frame.

Performance profiling is essential—identify whether your bottleneck is CPU (logic) or GPU (rendering). The game loop structure determines where optimization efforts focus. A poorly structured loop wastes resources through redundant calculations or cache misses.`,
                bullets: [
                    "Game loop cycles continuously: input → update logic → render",
                    "Delta time (elapsed since last frame) scales motion for framerate independence",
                    "Fixed timestep: simulate by fixed amount for consistent physics",
                    "Phase separation: clearly distinguish input, logic, and rendering phases",
                    "Profile performance to identify CPU vs GPU bottlenecks",
                ],
                exampleTitle: "Implementing a basic game loop with delta time",
                examples: {
                    python: `import pygame
import time

pygame.init()
screen = pygame.display.set_mode((800, 600))
clock = pygame.time.Clock()

# Game state
player_x = 400
player_y = 300
player_speed = 200  # pixels per second

running = True
while running:
    # Delta time: how much time passed since last frame
    dt = clock.tick(60) / 1000.0  # 60 FPS, convert milliseconds to seconds
    
    # PHASE 1: INPUT
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    
    # PHASE 2: UPDATE LOGIC
    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT]:
        player_x -= player_speed * dt  # Speed * elapsed time
    if keys[pygame.K_RIGHT]:
        player_x += player_speed * dt
    if keys[pygame.K_UP]:
        player_y -= player_speed * dt
    if keys[pygame.K_DOWN]:
        player_y += player_speed * dt
    
    # PHASE 3: RENDER
    screen.fill((0, 0, 0))
    pygame.draw.circle(screen, (255, 0, 0), (int(player_x), int(player_y)), 10)
    pygame.display.flip()

pygame.quit()`,
                    csharp: `// Unity game loop (built-in)
using UnityEngine;

public class PlayerController : MonoBehaviour {
    public float playerSpeed = 5f;
    
    void Update() {
        // Delta time: time since last frame
        float dt = Time.deltaTime;
        
        // PHASE 1: INPUT
        float horizontalInput = Input.GetAxis("Horizontal");
        float verticalInput = Input.GetAxis("Vertical");
        
        // PHASE 2: UPDATE LOGIC
        Vector3 movement = new Vector3(horizontalInput, 0, verticalInput) * playerSpeed * dt;
        transform.position += movement;
        
        // PHASE 3: RENDER (automatic after Update)
    }
}`,
                    java: `// Game loop in Java
public class GameLoop {
    private long lastFrameTime = System.currentTimeMillis();
    
    public void run() {
        while (gameRunning) {
            // Calculate delta time
            long currentTime = System.currentTimeMillis();
            float deltaTime = (currentTime - lastFrameTime) / 1000f;
            lastFrameTime = currentTime;
            
            // PHASE 1: INPUT
            handleInput();
            
            // PHASE 2: UPDATE
            update(deltaTime);
            
            // PHASE 3: RENDER
            render();
        }
    }
    
    private void update(float dt) {
        // Move player: position += velocity * dt
        player.position.x += player.velocity.x * dt;
        player.position.y += player.velocity.y * dt;
    }
}`,
                    javascript: `// Game loop with canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let playerX = 400, playerY = 300;
const playerSpeed = 200;  // pixels per second
let lastFrameTime = Date.now();

function gameFrame() {
    // Calculate delta time
    const now = Date.now();
    const dt = (now - lastFrameTime) / 1000;
    lastFrameTime = now;
    
    // PHASE 1: INPUT
    const keys = {};
    document.addEventListener('keydown', e => keys[e.key] = true);
    document.addEventListener('keyup', e => keys[e.key] = false);
    
    // PHASE 2: UPDATE LOGIC
    if (keys['ArrowLeft']) playerX -= playerSpeed * dt;
    if (keys['ArrowRight']) playerX += playerSpeed * dt;
    if (keys['ArrowUp']) playerY -= playerSpeed * dt;
    if (keys['ArrowDown']) playerY += playerSpeed * dt;
    
    // PHASE 3: RENDER
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(playerX, playerY, 10, 0, Math.PI * 2);
    ctx.fill();
    
    requestAnimationFrame(gameFrame);
}

gameFrame();`,
                },
            },
            {
                title: "Input handling",
                description: `Games respond to player input: keyboard, mouse, gamepad, touch. Input handling is the bridge between player and game world.

Keyboard: check key state in update loop (pressed/released). Avoid using key events for continuous movement—they have lag. Instead, event listeners set flags; update loop reads flags.

Mouse: track position, check button state. Raycasting translates screen coordinates to game world coordinates—important for determining which object player clicked.

Gamepad: multiple axes (joysticks), buttons, triggers. Normalized values [-1, 1] for joysticks, [0, 1] for triggers. Requires polling since gamepad API doesn't fire events.

Touch: finger tracking for mobile. Touches provide position, pressure, multiple finger tracking. Gestures (swipe, pinch) built on top of touch events.

Input mapping: player presses key, game interprets as action. Decoupling input from action enables remapping and multiple input methods.`,
                bullets: [
                    "Keyboard: use flags in update loop, not events",
                    "Mouse: track position, buttons, raycasting",
                    "Gamepad: axes and buttons, normalized values",
                    "Touch: finger tracking and gestures",
                    "Decouple input from action for flexibility",
                ],
                exampleTitle: "Handling keyboard and mouse input",
                examples: {
                    python: `import pygame

keys_pressed = {}

def handle_input():
    for event in pygame.event.get():
        if event.type == pygame.KEYDOWN:
            keys_pressed[event.key] = True
        if event.type == pygame.KEYUP:
            keys_pressed[event.key] = False

def update(dt):
    if keys_pressed.get(pygame.K_w):
        player_y -= speed * dt
    if keys_pressed.get(pygame.K_s):
        player_y += speed * dt
    mouse_x, mouse_y = pygame.mouse.get_pos()`,
                    csharp: `void Update() {
    if (Input.GetKey(KeyCode.W)) MoveUp();
    if (Input.GetKeyDown(KeyCode.Space)) Jump();
    
    Vector3 mousePos = Input.mousePosition;
}`,
                    java: `KeyListener listener = new KeyListener() {
    public void keyPressed(KeyEvent e) {
        keys[e.getKeyCode()] = true;
    }
    public void keyReleased(KeyEvent e) {
        keys[e.getKeyCode()] = false;
    }
};`,
                    javascript: `const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX - canvas.offsetLeft;
    mouseY = e.clientY - canvas.offsetTop;
});`,
                },
            },
            {
                title: "Collision detection",
                description: `Collision detection determines when game objects interact: player hits wall, bullet hits enemy, player picks up item. Without it, objects pass through each other.

Simple collision: axis-aligned bounding boxes (AABB)—rectangles aligned to x/y axes. Fast O(1) check: two rectangles overlap if they overlap on both axes. Sufficient for most games.

Circle collision: distance between centers < sum of radii. More accurate for circular objects but slower than AABB.

Spatial partitioning: for many objects, checking all pairs is O(n²). Divide space into grid cells or quadtree; only check collisions within nearby cells. Reduces complexity significantly.

Collision response: what happens after collision? Bounce, stop, take damage, trigger event. Response depends on object types and game design.`,
                bullets: [
                    "AABB: simple rectangle collision, O(1) check",
                    "Circle collision: distance-based",
                    "Spatial partitioning: optimize many-body collisions",
                    "Collision response varies by game design",
                    "Test collisions after physics updates",
                ],
                exampleTitle: "Implementing AABB collision detection",
                examples: {
                    python: `def aabb_collision(rect1, rect2):
    return (rect1.x < rect2.x + rect2.width and
            rect1.x + rect1.width > rect2.x and
            rect1.y < rect2.y + rect2.height and
            rect1.y + rect1.height > rect2.y)

# Usage
if aabb_collision(player, wall):
    player.x = wall.x - player.width`,
                    csharp: `bool AABBCollision(Rectangle a, Rectangle b) {
    return a.Left < b.Right && a.Right > b.Left &&
           a.Top < b.Bottom && a.Bottom > b.Top;
}`,
                    java: `boolean aabbCollision(int x1, int y1, int w1, int h1,
                        int x2, int y2, int w2, int h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 &&
           y1 < y2 + h2 && y1 + h1 > y2;
}`,
                    javascript: `function checkAABB(box1, box2) {
    return box1.x < box2.x + box2.width && 
           box1.x + box1.width > box2.x &&
           box1.y < box2.y + box2.height &&
           box1.y + box1.height > box2.y;
}`,
                },
            },
            {
                title: "Animation and sprite frames",
                description: `Animations bring games to life: character walking, explosion effects, flickering lights. Animations are sequences of images played rapidly.

Sprite sheet: single image containing multiple frames in a grid. More efficient than separate files. Index into grid to get current frame: frame_x = (frame_index % cols) * frame_width.

Animation state: current frame, total frames, frame duration, playback speed. Update: elapsed += dt; if elapsed > frame_duration, advance frame.

Looping vs one-shot: walk animation loops; death animation plays once. Track completion to know when one-shot animations finish.

Sprite scaling and rotation: transform render operations to show sprites at different sizes and angles without duplicating artwork.`,
                bullets: [
                    "Sprite sheets: grid of frames in single image",
                    "Track frame index, total frames, frame duration",
                    "Update: advance frame when elapsed time exceeds duration",
                    "Looping vs one-shot animations",
                    "Efficient rendering with sprite transforms",
                ],
                exampleTitle: "Animating a walking character",
                examples: {
                    python: `class Animation:
    def __init__(self, sprite_sheet, cols, frame_duration):
        self.sheet = sprite_sheet
        self.cols = cols
        self.frame_duration = frame_duration
        self.frame_index = 0
        self.elapsed = 0
    
    def update(self, dt):
        self.elapsed += dt
        if self.elapsed > self.frame_duration:
            self.frame_index += 1
            self.elapsed = 0
    
    def get_frame(self):
        col = self.frame_index % self.cols
        row = self.frame_index // self.cols
        return (col * frame_width, row * frame_height, frame_width, frame_height)`,
                    csharp: `class Sprite {
    public Texture2D sheet;
    public int frameIndex, cols;
    public float elapsed, frameDuration;
    
    public void Update(float dt) {
        elapsed += dt;
        if (elapsed > frameDuration) {
            frameIndex++;
            elapsed = 0;
        }
    }
}`,
                    java: `class Animation {
    int frameIndex = 0;
    float elapsed = 0;
    
    void update(float dt) {
        elapsed += dt;
        if (elapsed > frameDuration) {
            frameIndex++;
            elapsed = 0;
        }
    }
}`,
                    javascript: `class Animation {
    constructor(cols, frameDuration) {
        this.frameIndex = 0;
        this.elapsed = 0;
        this.cols = cols;
        this.frameDuration = frameDuration;
    }
    
    update(dt) {
        this.elapsed += dt;
        if (this.elapsed > this.frameDuration) {
            this.frameIndex++;
            this.elapsed = 0;
        }
    }
}`,
                },
            },
            {
                title: "Physics and movement",
                description: `Physics makes movement feel natural. Simple velocity-based movement is linear. Real physics includes acceleration, gravity, friction, and collision response.

Velocity: speed and direction. Update: position += velocity * dt.

Acceleration: changes velocity. Update: velocity += acceleration * dt. Gravity is constant downward acceleration (~9.8 m/s²).

Friction: resists motion. velocity *= (1 - friction) each frame. Prevents indefinite sliding.

Forces: F = ma. Sum forces on object, divide by mass to get acceleration. Enables multiple forces (gravity, friction, applied force) to combine naturally.

Rigid body simulations track position, velocity, acceleration, applying forces and detecting collisions. More complex but realistic.`,
                bullets: [
                    "Position += velocity * dt for movement",
                    "Velocity += acceleration * dt for acceleration",
                    "Gravity: constant downward acceleration",
                    "Friction: reduces velocity each frame",
                    "Forces combine naturally: F = ma",
                ],
                exampleTitle: "Implementing gravity and jumping",
                examples: {
                    python: `player_y = 100
player_vel_y = 0
gravity = 300  # pixels/s²
jump_force = 500  # pixels/s

def update(dt):
    global player_y, player_vel_y
    
    # Apply gravity
    player_vel_y += gravity * dt
    
    # Apply jump
    if jump_pressed:
        player_vel_y = -jump_force
    
    # Update position
    player_y += player_vel_y * dt
    
    # Ground collision
    if player_y >= ground_level:
        player_y = ground_level
        player_vel_y = 0`,
                    csharp: `float playerY = 100, playerVelY = 0;
const float gravity = 300f;

void Update(float dt) {
    playerVelY += gravity * dt;
    if (Input.GetKeyDown(KeyCode.Space))
        playerVelY = -500f;
    
    playerY += playerVelY * dt;
    if (playerY >= groundLevel) {
        playerY = groundLevel;
        playerVelY = 0;
    }
}`,
                    java: `float playerY = 100, playerVelY = 0;
void update(float dt) {
    playerVelY += 300 * dt;  // gravity
    playerY += playerVelY * dt;
}`,
                    javascript: `let playerY = 100, playerVelY = 0;
function update(dt) {
    playerVelY += 300 * dt;
    playerY += playerVelY * dt;
}`,
                },
            },
            {
                title: "State machines and game states",
                description: `Games have states: main menu, playing, paused, game over. State machines transition between states based on events. Each state has distinct behavior and visuals.

State pattern: create a class for each state (MenuState, PlayState, PauseState). Each state knows which transitions are valid. Player in playing state can pause (→ PauseState) but not go to menu directly. State machine enforces valid transitions.

Finite state machine (FSM) is formal model: states, transitions, events. Diagram states as circles, transitions as arrows labeled with triggering events. Helps identify missing transitions or invalid states.

Unity's Animator uses state machines for animations. Each animation is a state; transitions trigger when conditions met (speed > 0 → walking animation).

Real game flow: start in menu, click play → PlayState, ESC → PauseState (menu overlay), resume → PlayState, lose → GameOverState, main menu → MenuState. Each transition disables/enables appropriate systems.

Benefits: clearer code, prevents invalid state combinations, easier debugging (always know game state).`,
                bullets: [
                    "States represent game modes (menu, playing, paused)",
                    "Transitions: state changes triggered by events",
                    "Enforce valid transitions, prevent invalid combinations",
                    "State pattern: each state is a class/object",
                    "Simplifies code, improves maintainability",
                ],
                exampleTitle: "Implementing a game state machine",
                examples: {
                    python: `from enum import Enum

class GameState(Enum):
    MENU = 1
    PLAYING = 2
    PAUSED = 3
    GAME_OVER = 4

class StateMachine:
    def __init__(self):
        self.state = GameState.MENU
        self.transitions = {
            GameState.MENU: [GameState.PLAYING],
            GameState.PLAYING: [GameState.PAUSED, GameState.GAME_OVER],
            GameState.PAUSED: [GameState.PLAYING, GameState.MENU],
            GameState.GAME_OVER: [GameState.MENU]
        }
    
    def transition(self, new_state: GameState):
        if new_state in self.transitions[self.state]:
            print(f"Transition: {self.state} -> {new_state}")
            self.state = new_state
        else:
            print(f"Invalid transition from {self.state} to {new_state}")

sm = StateMachine()
sm.transition(GameState.PLAYING)  # OK
sm.transition(GameState.PAUSED)   # OK
sm.transition(GameState.MENU)     # OK`,
                    csharp: `enum GameState { Menu, Playing, Paused, GameOver }

class StateMachine {
    private GameState currentState = GameState.Menu;
    private Dictionary<GameState, List<GameState>> transitions;
    
    public StateMachine() {
        transitions = new() {
            {GameState.Menu, new() {GameState.Playing}},
            {GameState.Playing, new() {GameState.Paused, GameState.GameOver}},
            {GameState.Paused, new() {GameState.Playing, GameState.Menu}},
            {GameState.GameOver, new() {GameState.Menu}}
        };
    }
    
    public void Transition(GameState newState) {
        if (transitions[currentState].Contains(newState)) {
            currentState = newState;
            Console.WriteLine(\$"State: {currentState}\");
        }
    }
}`,
                    java: `enum State { MENU, PLAYING, PAUSED, GAME_OVER }

class GameStateMachine {
    private State currentState = State.MENU;
    
    public void update() {
        switch (currentState) {
            case MENU:
                handleMenuInput();
                break;
            case PLAYING:
                updateGame();
                handlePlayInput();
                break;
            case PAUSED:
                handlePauseInput();
                break;
        }
    }
    
    private void handleMenuInput() {
        if (inputSystem.isKeyPressed(KeyCode.ENTER)) {
            currentState = State.PLAYING;
        }
    }
}`,
                    javascript: `const GameState = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER'
};

class StateMachine {
    constructor() {
        this.state = GameState.MENU;
        this.transitions = {
            [GameState.MENU]: [GameState.PLAYING],
            [GameState.PLAYING]: [GameState.PAUSED, GameState.GAME_OVER],
            [GameState.PAUSED]: [GameState.PLAYING, GameState.MENU],
            [GameState.GAME_OVER]: [GameState.MENU]
        };
    }
    
    transition(newState) {
        if (this.transitions[this.state].includes(newState)) {
            this.state = newState;
            console.log(\`State: \${this.state}\`);
        }
    }
}`,
                },
            },
            {
                title: "Camera systems",
                description: `The camera defines what players see. Fixed camera (top-down shooter) shows fixed area. Following camera (3D games) centers on player. Camera mechanics dramatically affect gameplay feel.

Following camera: position camera behind/above player. Lag it slightly (camera catches up gradually) for smooth experience. Instant centering feels jerky. Lead camera by moving it in player's direction of movement—anticipates turns.

Culling optimizes rendering. Objects outside camera view don't need rendering. Frustum culling: check if object's bounding box overlaps camera's view volume. Occlusion culling: objects behind walls are invisible, don't render them.

Viewport: visible area in world space. Screen has fixed resolution; viewport maps screen coordinates to world coordinates. Raycasting uses this: screen click → world position → determine which object clicked.

Parallax scrolling creates depth. Layers move at different speeds: background slower, foreground faster. Creates illusion of depth even in 2D.

Real scenario: 3D game, player explores world. Camera locked behind player, rotates when player turns. Fog of war: objects far away fade out. Far clipping plane: objects beyond distance hidden. Performance improves since distant objects don't render.`,
                bullets: [
                    "Fixed camera: static view, no tracking",
                    "Following camera: track player with smoothing/lag",
                    "Frustum culling: don't render off-screen objects",
                    "Viewport: maps screen to world coordinates",
                    "Parallax: layers move at different speeds for depth",
                ],
                exampleTitle: "Implementing a following camera with lag",
                examples: {
                    python: `class Camera:
    def __init__(self, target, speed=0.1):
        self.position = target.position.copy()
        self.target = target
        self.speed = speed  # Lag factor
    
    def update(self):
        # Smooth follow: lerp toward target
        self.position += (self.target.position - self.position) * self.speed
        
        # Calculate view matrix from position
        view = self.look_at(self.position, self.target.position)
        return view
    
    def screen_to_world(self, screen_pos, screen_size):
        # Map screen coordinates to world
        normalized = (screen_pos[0] / screen_size[0], screen_pos[1] / screen_size[1])
        # Apply camera transform...`,
                    csharp: `class Camera {
    public Vector3 Position { get; set; }
    private Transform target;
    private float followSpeed = 0.1f;
    
    public void Update() {
        // Lerp toward target
        Vector3 direction = target.position - Position;
        Position += direction * followSpeed;
        
        // Update view matrix
        transform.position = Position;
        transform.LookAt(target);
    }
    
    public Vector3 ScreenToWorldPoint(Vector3 screenPos) {
        Ray ray = GetComponent<Camera>().ScreenPointToRay(screenPos);
        return ray.GetPoint(distance);
    }
}`,
                    java: `class Camera {
    private Vector3 position;
    private Vector3 target;
    private float speed = 0.1f;
    
    public void update(Transform playerTransform) {
        Vector3 desired = playerTransform.getPosition();
        position = Vector3.lerp(position, desired, speed);
        
        Matrix4 view = Matrix4.lookAt(position, desired, new Vector3(0, 1, 0));
    }
}`,
                    javascript: `class Camera {
    constructor(target) {
        this.position = {x: 0, y: 0};
        this.target = target;
        this.followSpeed = 0.1;
    }
    
    update() {
        const dx = this.target.x - this.position.x;
        const dy = this.target.y - this.position.y;
        
        this.position.x += dx * this.followSpeed;
        this.position.y += dy * this.followSpeed;
    }
    
    apply(ctx) {
        ctx.translate(-this.position.x, -this.position.y);
    }
}`,
                },
            },
            {
                title: "Audio systems",
                description: `Audio enhances immersion. Sound effects (footsteps, explosions) provide feedback. Music sets mood. Spatial audio (sounds come from direction) reinforces 3D presence.

Audio sources: play sounds from positions. 3D audio: pan (left/right), attenuation (quieter with distance). Listener: player's ear position. Volume, pitch, effects (reverb) adjustable.

Sound mixing: multiple sounds at once. Careful mixing prevents cacophony. Audio buses route multiple sources to shared effects. Master bus is final output; adjust master volume to control everything.

Streaming vs samples: small sounds (footsteps) are samples (loaded in memory). Long music is streamed (loaded in chunks). Memory efficient for long audio.

Real game: player footsteps create different sounds on different surfaces. Concrete: hard clack. Grass: soft thud. System checks surface material, picks appropriate sample, plays at 3D position with fall-off.`,
                bullets: [
                    "Audio sources: emit sound from position",
                    "3D audio: panning, distance attenuation",
                    "Listener: player's ear, main audio reference",
                    "Audio buses: group sounds, apply shared effects",
                    "Streaming: large audio loaded in chunks",
                ],
                exampleTitle: "Creating spatial audio in a 3D game",
                examples: {
                    python: `import pygame
pygame.mixer.init()

class AudioSource:
    def __init__(self, filename, position=(0, 0)):
        self.sound = pygame.mixer.Sound(filename)
        self.position = position
        self.channel = None
    
    def play(self):
        self.channel = self.sound.play()
    
    def set_volume(self, volume):
        # volume 0.0-1.0
        self.sound.set_volume(volume)
    
    def update_3d(self, listener_pos):
        # Simple panning: left=-1.0, right=1.0
        dx = self.position[0] - listener_pos[0]
        pan = max(-1.0, min(1.0, dx / 100))
        self.sound.set_volume(self.sound.get_volume(), pan)

audio = AudioSource('footstep.wav', (100, 0))
audio.play()`,
                    csharp: `var audioSource = GetComponent<AudioSource>();
audioSource.clip = Resources.Load<AudioClip>("Sounds/footstep");
audioSource.spatialBlend = 1f;  // 1 = fully 3D
audioSource.volume = 0.8f;
audioSource.Play();`,
                    java: `AudioClip sound = AudioSystem.getAudioInputStream(new File("footstep.wav"));
SourceDataLine line = AudioSystem.getSourceDataLine(format);
line.open(format);
line.start();

// Write audio data to line
byte[] data = new byte[1024];
int bytesRead;
while ((bytesRead = sound.read(data)) != -1) {
    line.write(data, 0, bytesRead);
}`,
                    javascript: `// Web Audio API
const audioContext = new AudioContext();
const audioSource = audioContext.createBufferSource();

// Load audio
fetch('footstep.wav')
    .then(r => r.arrayBuffer())
    .then(buffer => audioContext.decodeAudioData(buffer))
    .then(decoded => {
        audioSource.buffer = decoded;
        audioSource.connect(audioContext.destination);
        audioSource.start();
    });

// Spatial audio with Panner
const panner = audioContext.createPanner();
panner.positionX.value = 100;
panner.positionY.value = 0;
audioSource.connect(panner);
panner.connect(audioContext.destination);`,
                },
            },
            {
                title: "Particle effects",
                description: `Particle systems create effects: explosions, fire, rain, magic spells. Individual particles are simple (position, velocity, lifetime). Hundreds to thousands together create complex effects.

Each particle: position, velocity, color, size, lifetime. Update loop: advance time, apply physics (gravity), remove dead particles. Render all particles with shared texture/material.

Particle emitters spawn particles: rate (particles/second), velocity range, lifetime range. Emitter can follow object (magic spell follows player).

Optimization: pool particles. Don't allocate/deallocate; reuse objects. Reduces garbage collection pauses. Batch render particles together to reduce draw calls.

Real scenario: explosion: emitter at impact point, particles spray outward with gravity pulling down, fade out over time. Fire: particles rise with slight randomness, fade and shrink. Rain: emitter above, particles fall, loop when hitting ground.`,
                bullets: [
                    "Particles: simple objects with position, velocity, lifetime",
                    "Emitters: spawn particles at rates and velocities",
                    "Physics: gravity, wind, collision influence particles",
                    "Pooling: reuse particles to avoid allocation overhead",
                    "Batch rendering: multiple particles in single draw call",
                ],
                exampleTitle: "Implementing a fire particle effect",
                examples: {
                    python: `import random
import math

class Particle:
    def __init__(self, x, y, vx, vy, lifetime):
        self.x, self.y = x, y
        self.vx, self.vy = vx, vy
        self.lifetime = lifetime
        self.age = 0
    
    def update(self, dt):
        self.x += self.vx * dt
        self.y += self.vy * dt
        self.vy -= 9.8 * dt  # gravity
        self.age += dt
    
    def is_alive(self):
        return self.age < self.lifetime
    
    def alpha(self):
        return 1.0 - (self.age / self.lifetime)

class ParticleEmitter:
    def __init__(self, x, y):
        self.x, self.y = x, y
        self.particles = []
    
    def emit(self, count):
        for _ in range(count):
            angle = random.uniform(0, 2 * math.pi)
            speed = random.uniform(50, 150)
            vx = math.cos(angle) * speed
            vy = math.sin(angle) * speed
            self.particles.append(Particle(self.x, self.y, vx, vy, 2.0))
    
    def update(self, dt):
        for p in self.particles:
            p.update(dt)
        self.particles = [p for p in self.particles if p.is_alive()]`,
                    csharp: `public class Particle {
    public Vector3 position, velocity;
    public float lifetime, age;
    public Color color;
    
    public void Update(float dt) {
        position += velocity * dt;
        velocity.y -= 9.8f * dt;
        age += dt;
    }
    
    public float Alpha => 1f - (age / lifetime);
}

public class ParticleEmitter : MonoBehaviour {
    public int emissionRate = 10;
    private List<Particle> particles = new();
    
    void Update() {
        // Emit
        for (int i = 0; i < emissionRate; i++) {
            var angle = Random.Range(0, 360) * Mathf.Deg2Rad;
            var p = new Particle {
                position = transform.position,
                velocity = new Vector3(Mathf.Cos(angle), Random.Range(5, 15), 0),
                lifetime = 2f
            };
            particles.Add(p);
        }
        
        // Update
        foreach (var p in particles) p.Update(Time.deltaTime);
        particles.RemoveAll(p => p.age > p.lifetime);
    }
}`,
                    java: `class Particle {
    Vector3 pos, vel;
    float lifetime, age;
    
    void update(float dt) {
        pos.add(Vector3.mul(vel, dt));
        vel.y -= 9.8f * dt;
        age += dt;
    }
    
    boolean isAlive() { return age < lifetime; }
}`,
                    javascript: `class Particle {
    constructor(x, y, vx, vy, lifetime) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.lifetime = lifetime;
        this.age = 0;
    }
    
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy -= 9.8 * dt;
        this.age += dt;
    }
    
    alpha() {
        return 1 - (this.age / this.lifetime);
    }
}

class ParticleEmitter {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particles = [];
    }
    
    emit(count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 100;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            this.particles.push(
                new Particle(this.x, this.y, vx, vy, 2)
            );
        }
    }
    
    update(dt) {
        this.particles.forEach(p => p.update(dt));
        this.particles = this.particles.filter(p => p.age < p.lifetime);
    }
}`,
                },
            },
        ],
    },
]

