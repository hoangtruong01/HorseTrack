# AI Research Instructions
You are a senior AI researcher, software architect, data scientist, and academic paper advisor.
I am conducting an applied AI research project based on the following domain:
**Horse Racing Tournament Management System**
Reference article:
https://blog.nycdatascience.com/blog/student-works/capstone/predicting-horse-racing-outcomes
The purpose of this study is NOT to invent a new machine learning model. Instead, the objective is to investigate how existing AI techniques can be integrated into a Horse Racing Tournament Management System and evaluate their effectiveness in prediction support, recommendation, and tournament management automation.
---
# SYSTEM DOMAIN
## System Title
AI-powered Horse Racing Tournament Management System
## Problem Context
Horse racing tournaments involve multiple stakeholders:
* Horse Owners
* Jockeys
* Race Referees
* Spectators
* Administrators
Current management processes are largely manual and fragmented, leading to:
* Scheduling difficulties
* Registration management issues
* Inefficient race organization
* Human errors
* Limited prediction support
* Lack of intelligent decision-making tools
The proposed system aims to digitize tournament operations while integrating AI-based prediction and recommendation capabilities.
---
# REQUIRED TASK 1
Analyze the reference article first.
Provide:
## Paper Summary
* Research objective
* Dataset used
* Features used
* Machine learning algorithms
* Evaluation metrics
* Experimental setup
* Main results
* Limitations
## AI Insights
Explain:
* Why machine learning works for horse racing prediction
* What factors most influence race outcomes
* Which features are most important
* What data would realistically be available in a tournament management system
---
# REQUIRED TASK 2
Create a Literature Review Entry
Use academic writing style.
Provide:
## Citation
## Problem
## Method
## Dataset
## Evaluation
## Results
## Limitations
## Relevance to Our Topic
## Possible Improvements
Format exactly as a paper summary suitable for:
02_related_work/paper_summaries/paper_01.md
---
# REQUIRED TASK 3
Create a Literature Review Matrix Row
Generate a complete row for:
02_related_work/literature_review_matrix.md
Columns:
| Paper Title | Year | Venue | Domain | AI Method | Dataset | Metrics | Main Contribution | Limitation | Relevance to Our Topic |
---
# REQUIRED TASK 4
Identify Research Gap
Using:
* The reference article
* Existing horse racing prediction studies
* Existing sports prediction systems
Generate:
## Problem Statement
## Existing Solutions
## Limitations of Existing Studies
## Research Gap
## Why This Gap Matters
## Proposed Contribution
Focus on gaps related to:
* Tournament management
* Race scheduling
* Jockey recommendation
* Decision support
* Spectator prediction assistance
rather than pure betting prediction.
---
# REQUIRED TASK 5
Create Research Questions
Generate:
## Main Research Question
and
## RQ1
## RQ2
## RQ3
## RQ4
The questions should evaluate both:
* AI prediction performance
* Management system effectiveness
---
# REQUIRED TASK 6
Design an AI-powered Horse Racing Tournament Management System
Provide:
## System Overview
## Main Actors
* Horse Owner
* Jockey
* Referee
* Spectator
* Admin
## Main Functional Modules
### Horse Management
### Jockey Management
### Tournament Management
### Race Scheduling
### Prediction Management
### Ranking Management
### Referee Management
---
# REQUIRED TASK 7
Recommend the Best AI Integration
Evaluate and compare:
### Option 1
Race Outcome Prediction
### Option 2
Jockey Recommendation
### Option 3
Spectator Prediction Assistant
### Option 4
Tournament Decision Support
For each option provide:
* Input
* Output
* Model
* Advantages
* Disadvantages
* Dataset Requirement
* Evaluation Method
Then recommend the most suitable option for an academic paper.
---
# REQUIRED TASK 8
Generate System Architecture
Include:
## Frontend
React / Next.js
## Backend
Node.js / NestJS
## Database
MongoDB
## AI Service
Python FastAPI
## Machine Learning Model
Random Forest
XGBoost
Gradient Boosting
Compare these models and recommend the best one.
Provide:
## Architecture Diagram (Text Version)
User
→ Frontend
→ Backend API
→ Database
→ AI Service
→ Prediction Result
---
# REQUIRED TASK 9
Generate Evaluation Plan
Include:
## Dataset
Possible data sources
## Baseline
Manual prediction
Rule-based prediction
Random prediction
## Metrics
Accuracy
Precision
Recall
F1-score
ROC-AUC
Prediction Latency
User Satisfaction
## Evaluation Procedure
Step-by-step methodology.
---
# REQUIRED TASK 10
Generate Topic Proposal
Produce a complete Topic Proposal including:
* Proposed Title
* Application Domain
* Problem Statement
* Motivation
* Target Users
* Proposed AI Model
* Main Features
* Expected Contributions
* Evaluation Plan
* Related Work Direction
Format suitable for:
01_topic_proposal/topic_proposal.md
---
# IMPORTANT WRITING RULES
* Academic style
* Suitable for conference paper preparation
* Avoid fabricated statistics
* Avoid fake citations
* Clearly separate facts from assumptions
* If information is unavailable, explicitly state assumptions
# FINAL POSITIONING
This study does not aim to develop a new machine learning algorithm.
Instead, it investigates how existing machine learning models can be integrated into a Horse Racing Tournament Management System and evaluates their effectiveness in improving prediction support, tournament management efficiency, and decision-making.
