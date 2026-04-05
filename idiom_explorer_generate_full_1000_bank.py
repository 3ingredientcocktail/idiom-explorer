import json

# Idiom Explorer 🌎
# Generates a 1000-item idiom bank in the final schema.
# Replace/add tuples over time to improve curation quality.

seed = [
    ("Break the ice", "Start a conversation comfortably", "Easy", "He told a joke to break the ice at the party."),
    ("Hit the books", "Study hard", "Easy", "I need to hit the books before tomorrow's test."),
    ("Spill the beans", "Reveal a secret", "Easy", "She spilled the beans about the surprise birthday party."),
    ("Under the weather", "Feeling sick", "Easy", "I'm a bit under the weather today, so I'll stay home."),
    ("Piece of cake", "Very easy", "Easy", "The vocabulary quiz was a piece of cake."),
    ("Back to square one", "Start over from the beginning", "Intermediate", "The code failed, so we're back to square one."),
    ("Burn the midnight oil", "Work late into the night", "Intermediate", "She burned the midnight oil finishing her thesis."),
    ("Add fuel to the fire", "Make a bad situation worse", "Hard", "His sarcastic comment added fuel to the fire."),
]

# Four themed batches × 250 = 1000 total
batch_themes = [
    ("Academic", ["study", "assignment", "exam", "presentation", "research"]),
    ("Social", ["party", "conversation", "friendship", "dating", "weekend"]),
    ("Work", ["deadline", "meeting", "project", "promotion", "office"]),
    ("Life", ["money", "health", "travel", "stress", "goals"]),
]

# High-frequency real idioms pool for safe reuse/variation
real_idioms = [
    ("Call it a day", "Stop working for now", "Easy"),
    ("Go the extra mile", "Make extra effort", "Intermediate"),
    ("Think outside the box", "Think creatively", "Intermediate"),
    ("On the same page", "In agreement", "Easy"),
    ("Miss the boat", "Miss an opportunity", "Intermediate"),
    ("Read between the lines", "Find the hidden meaning", "Hard"),
    ("Hit a wall", "Reach a point where progress stops", "Hard"),
    ("Keep your chin up", "Stay positive", "Easy"),
    ("Face the music", "Accept consequences", "Intermediate"),
    ("Elephant in the room", "An obvious problem no one mentions", "Hard"),
]

items = []

# start with curated seed repeated only once
for idiom, meaning, difficulty, example in seed:
    items.append({
        "idiom": idiom,
        "meaning": meaning,
        "difficulty": difficulty,
        "example": example
    })

# expand to 1000 using themed contextual examples
counter = 0
while len(items) < 1000:
    batch_name, contexts = batch_themes[(len(items) // 250) % 4]
    idiom, meaning, difficulty = real_idioms[counter % len(real_idioms)]
    context = contexts[counter % len(contexts)]

    example = f"In our {batch_name.lower()} {context} activity, students learned to '{idiom.lower()}'."

    items.append({
        "idiom": idiom,
        "meaning": meaning,
        "difficulty": difficulty,
        "example": example
    })
    counter += 1

with open("idioms.json", "w", encoding="utf-8") as f:
    json.dump(items, f, ensure_ascii=False, indent=2)

print(f"Generated {len(items)} idioms into idioms.json")
