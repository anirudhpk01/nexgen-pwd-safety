import os

# os.system('pip install google-generativeai fitz pymupdf chromadb langchain sentence-transformers langchain_openai langchain_chroma langchain_community langchain_huggingface sentence-transformers')

import google.generativeai as genai
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter

# Step 1: Load and preprocess the document
loader = TextLoader(r"pwd_policy.txt")
documents = loader.load()

# Step 2: Split the document into smaller chunks for better retrieval
text_splitter = CharacterTextSplitter(chunk_size=300, chunk_overlap=50)
docs = text_splitter.split_documents(documents)

# Step 3: Initialize embeddings and Chroma vector store
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vs = Chroma.from_documents(documents=docs, embedding=embedding_model, persist_directory="./rag_db_index")

# Step 4: Queries to search for relevant information
queries = [
    "minimum length or size of password",
    "contain capital letters or upper case letters",
    "contain small letters or lower case letters",
    "contain special characters",
    "contain numbers",
    "patterns to be present",
    "patterns to avoid",
    "contain small letters or lower case letters",
    "contain prefix",
    "contain suffix"
]

# Step 5: Retrieve top context chunks
retrieved_contexts = []
for query in queries:
    results = vs.similarity_search(query, k=2)
    for res in results:
        if res.page_content not in retrieved_contexts:
            retrieved_contexts.append(res.page_content)

# Combine the retrieved contexts into a single prompt
context = "\n\n".join(retrieved_contexts[:6])  # Limit to avoid excessive context

# Step 6: Construct a clear, structured prompt
user_question = (
    "Given the context, generate a JSON object with the following fields: \n"
    "- minimum_length\n"
    "- no_of_capital_letters\n"
    "- no_of_special_characters\n"
    "- no_of_numbers\n"
    "- prefix\n"
    "- suffix\n"
    "- no_of_small_letters\n"
    "- patterns_to_be_present (array)\n"
    "- anti_patterns (array)\n"
    "Ensure the values align with the given password policy."
)
prompt = f"Context:\n{context}\n\nQuestion: {user_question}\nAnswer:"

# Step 7: Configure and interact with Gemini API
genai.configure(api_key="AIzaSyBV-hLPLJMBj8whJ29un5qO14FHeyKeGqQ")
model = genai.GenerativeModel("gemini-pro")
response = model.generate_content(prompt)

# Step 8: Print the generated JSON response
print("Gemini Response:", response.text)
