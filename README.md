# Memory-Genesis
🧠 AI Multidimensional Memory Visualization System  
🚀 Powered by EverMemOS Architecture

## 📖 Project Introduction
Memory-Genesis is a visualized frontend interface for an AI multidimensional memory system, designed to display the construction process of memory and the logic of intelligent memory retrieval.  

This demo strictly adheres to the design specifications and memory schema of EverMemOS (https://github.com/EverMind-AI/EverMemOS). We have completed all the design work for engineering integration, and will connect to the official EverMemOS backend in subsequent iterations to enable real memory operation capabilities.

## 🔗 Live Demo (Online Preview)
Experience the static visualization demo (index.html) directly in your browser:  
https://memory-genesis.pages.dev/

## 🔧 System Architecture
### Core Workflow (Aligned with EverMemOS)
User Dialogue → Structured Memory Extraction (MemCell) → Memory Storage → Multi-Strategy Retrieval → Dialogue Response

### Engineering Design (Completed & To Be Implemented)
| Module                | Status                  | Key Details                                                                 |
|-----------------------|-------------------------|-----------------------------------------------------------------------------|
| EverMemOS API Integration | Design Completed       | Aligned with EverMemOS OpenAPI specs; data format mapping finalized         |
| Backend Storage       | Design Completed       | PostgreSQL + Redis schema defined (time/content/role/relevance score fields)|
| Role-based Deduction  | Design Completed       | 3 core roles (User/Assistant/Admin) with access control rules               |
| AI API Integration    | Design Completed       | LLM wrapper for memory extraction (compatible with EverMemOS LLM)            |

## ✨ Core Features (Frontend Demo - index.html)
- Intuitive visual dialogue interface for memory interaction
- Multidimensional memory panel displaying EverMemOS-style structured memory units
- Simulated memory storage/retrieval process (matching EverMemOS workflow)
- Lightweight static HTML implementation (index.html, zero backend dependency)
- Cloudflare Pages deployment (memory-genesis.pages.dev) for fast global access

## 🖥 Quick Start (Run index.html Locally)
This is a static frontend demo with no backend requirements:
1. Clone the repository: `git clone https://github.com/MyraWang0406/Memory-Genesis.git`
2. Navigate to the repository folder: `cd Memory-Genesis`
3. Open `index.html` directly in any modern browser (Chrome/Firefox/Safari)
4. Interact with the interface to preview memory visualization

## 📌 Future Roadmap (EverMemOS Integration)
### Short-term (2-3 Weeks)
- Complete EverMemOS API connection for real memory extraction
- Implement SQLite-based lightweight memory storage (minimum viable version)
### Mid-term (1-2 Months)
- Deploy PostgreSQL + Redis for production-level memory storage
- Enable role-based memory access control (User/Admin separation)
### Long-term (2+ Months)
- Integrate LLM API for dynamic memory generation
- Add quantitative evaluation metrics (aligned with EverMemOS benchmarks)
- Support multi-modal memory (text/image/audio)

## 📄 License
This project is open-source under the Apache 2.0 License (consistent with EverMemOS licensing).
