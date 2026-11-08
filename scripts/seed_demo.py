"""Demo seeder script: populates NEXUS AI database with a sample research project and generated report."""

import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.database.session import AsyncSessionLocal, init_db
from app.models.user import User
from app.models.research import ResearchProject, ResearchPlan, ResearchSource, ExtractedFinding, VerificationResult
from app.models.report import Report, UsageRecord
from app.core.security import get_password_hash
from app.services.pdf_generator import PDFReportGenerator


async def seed():
    print("Initializing database...")
    await init_db()

    async with AsyncSessionLocal() as db:
        # 1. Create or get demo user
        from sqlalchemy import select
        res = await db.execute(select(User).where(User.email == "demo@nexus-ai.org"))
        user = res.scalar_one_or_none()
        if not user:
            user = User(
                email="demo@nexus-ai.org",
                hashed_password=get_password_hash("nexus_password_123"),
                full_name="Dr. Eleanor Vance",
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            print(f"Created demo user: {user.email}")

        # 2. Create sample completed research project
        project_id = "demo-agentic-ai-survey-2026"
        res_p = await db.execute(select(ResearchProject).where(ResearchProject.id == project_id))
        if res_p.scalar_one_or_none():
            print("Demo project already exists.")
            return

        question = (
            "Research the latest developments in Agentic AI, compare five important research papers, "
            "identify existing limitations, discover research gaps and generate a detailed report with citations."
        )

        project = ResearchProject(
            id=project_id,
            user_id=user.id,
            title="Comprehensive Survey on Agentic AI & Cyclic Multi-Agent Architectures",
            research_question=question,
            mode="academic",
            depth="exhaustive",
            max_sources=5,
            include_academic=True,
            status="completed",
        )
        db.add(project)

        # 3. Create Plan
        plan = ResearchPlan(
            project_id=project_id,
            domain="Computer Science - Multi-Agent Artificial Intelligence",
            complexity="High",
            objectives=[
                "Compare 5 foundational multi-agent architectures (LangGraph, AutoGen, CrewAI, MetaGPT, ChatDev).",
                "Extract empirical benchmarks, error mitigation protocols, and tool use accuracy.",
                "Isolate system limitations and formulate evidence-supported research gaps.",
            ],
            subtasks=[
                {"id": "t1", "title": "Literature Retrieval", "description": "Query arXiv and Semantic Scholar for primary architecture papers", "priority": 1, "agent": "Research Agent"},
                {"id": "t2", "title": "Fact & Metric Extraction", "description": "Extract accuracy metrics, tokens per task, and recovery rates", "priority": 2, "agent": "Information Extraction Agent"},
                {"id": "t3", "title": "Comparative Synthesis", "description": "Analyze state machine vs message-bus paradigms", "priority": 3, "agent": "Analysis Agent"},
                {"id": "t4", "title": "Citation Audit", "description": "Verify empirical assertions against cited papers in feedback loop", "priority": 4, "agent": "Verification Agent"},
            ],
            search_queries=[
                "agentic AI multi-agent architecture benchmark comparison",
                "cyclic graph state machine autonomous reasoning",
                "hallucination reduction verification loop agent team",
            ],
            expected_evidence=["Empirical task completion rates", "Formal state transition specifications"],
            strategy="Employ dual academic search with strict citation alignment and cyclic feedback retries.",
            is_approved=True,
        )
        db.add(plan)

        # 4. Create Sources
        sources_data = [
            {
                "idx": 1,
                "title": "A Survey on Large Language Model based Autonomous Agents",
                "url": "https://arxiv.org/abs/2308.11432",
                "type": "arxiv",
                "authors": ["L. Wang", "C. Ma", "X. Feng", "Z. Zhang"],
                "pub": "2024",
                "snippet": "Comprehensive taxonomical review of LLM agent architectures highlighting unified cognitive components: profiling, memory, planning, and action execution.",
            },
            {
                "idx": 2,
                "title": "Communicative Agents for Software Development (ChatDev)",
                "url": "https://arxiv.org/abs/2307.07924",
                "type": "arxiv",
                "authors": ["C. Qian", "X. Cong", "W. Liu", "C. Yang"],
                "pub": "2024",
                "snippet": "Demonstrates multi-agent role-playing with chat chain mechanism reducing code hallucination by 42% over single-agent prompts.",
            },
            {
                "idx": 3,
                "title": "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation",
                "url": "https://arxiv.org/abs/2308.08155",
                "type": "arxiv",
                "authors": ["Q. Wu", "G. Bansal", "J. Zhang", "Y. Wu"],
                "pub": "2024",
                "snippet": "Conversable agent framework allowing dynamic multi-agent topologies and human participation for complex collaborative problem solving.",
            },
            {
                "idx": 4,
                "title": "MetaGPT: Meta Programming for A Multi-Agent Collaborative Framework",
                "url": "https://arxiv.org/abs/2308.00352",
                "type": "arxiv",
                "authors": ["S. Hong", "M. Zhuge", "J. Chen", "X. Zheng"],
                "pub": "2024",
                "snippet": "Encodes Standard Operating Procedures (SOPs) into multi-agent workflows, structuring communicative outputs into formalized PRDs and designs.",
            },
            {
                "idx": 5,
                "title": "Stateful Orchestration in Graph-Based Agent Workflows",
                "url": "https://arxiv.org/abs/2402.01234",
                "type": "arxiv",
                "authors": ["H. Chase", "J. Rehwaldt", "E. Harrison"],
                "pub": "2025",
                "snippet": "Presents cyclic state graphs as an expressive foundation for branching, checkpointing, and conditional human-in-the-loop review.",
            },
        ]

        for s in sources_data:
            src = ResearchSource(
                project_id=project_id,
                source_index=s["idx"],
                title=s["title"],
                url=s["url"],
                source_type=s["type"],
                authors=s["authors"],
                publication_date=s["pub"],
                snippet=s["snippet"],
                reliability_score=0.96,
                relevance_score=0.94,
            )
            db.add(src)

        # 5. Create Findings
        findings_data = [
            ("fact", "Role specialization dividing planning and execution diminishes error propagation across multi-step tasks.", 1, 0.95),
            ("statistic", "Chat-chain communicative frameworks achieve a 42% decrease in syntax and logic hallucinations compared to direct single-turn LLMs.", 2, 0.92),
            ("methodology", "Encoding Standard Operating Procedures (SOPs) via structured schema constraints enforces deterministic artifact handoffs between agents.", 4, 0.94),
            ("concept", "Cyclic state graph transitions enable intermediate self-correction loops and verification barriers prior to state commitment.", 5, 0.97),
        ]
        for ftype, stmt, sidx, conf in findings_data:
            finding = ExtractedFinding(
                project_id=project_id,
                finding_type=ftype,
                statement=stmt,
                evidence_quote=stmt,
                confidence=conf,
                tags=["multi-agent", "benchmarks", "architecture"],
            )
            db.add(finding)

        # 6. Verification
        db.add(VerificationResult(
            project_id=project_id,
            claim="Role specialization dividing planning and execution diminishes error propagation.",
            status="verified",
            confidence_score=0.95,
            supporting_source_indices=[1, 4],
            required_additional_research=False,
        ))
        db.add(VerificationResult(
            project_id=project_id,
            claim="Chat-chain mechanisms achieve a 42% decrease in syntax and logic hallucinations.",
            status="verified",
            confidence_score=0.92,
            supporting_source_indices=[2],
            required_additional_research=False,
        ))

        # 7. Generate PDF and Report
        sections = [
            {"title": "1. Executive Summary", "order": 1, "content": "Agentic AI is undergoing a foundational paradigm shift from isolated conversational agents to orchestrated, graph-based multi-agent swarms. This survey synthesizes 5 influential frameworks, demonstrating that cyclic state graphs combined with rigorous verification loops dramatically reduce hallucination rates."},
            {"title": "2. Introduction", "order": 2, "content": "As modern software and decision systems tackle long-horizon reasoning tasks, single-prompt LLM interactions face catastrophic context dilution. Multi-agent topologies decouple responsibilities, allowing individual agents to specialize in planning, information retrieval, factual extraction, and quality audit."},
            {"title": "3. Research Objectives", "order": 3, "content": "1. Analyze 5 state-of-the-art agent frameworks.\n2. Quantify empirical gains in factual grounding and code synthesis.\n3. Discover systemic limitations and outline future research trajectories."},
            {"title": "4. Research Methodology", "order": 4, "content": "Autonomous 6-agent LangGraph workflow with human-in-the-loop plan authorization, multi-source literature retrieval across arXiv and Semantic Scholar, and citation grounding checks."},
            {"title": "5. Related Research", "order": 5, "content": "Foundational literature reviewed includes Wang et al. (Autonomous Agents Taxonomy), Qian et al. (ChatDev), Wu et al. (AutoGen), Hong et al. (MetaGPT), and Chase et al. (Graph-Based Orchestration)."},
            {"title": "6. Empirical Findings", "order": 6, "content": "- Structured SOPs reduce multi-turn context drift.\n- Role-based separation demonstrates 42% fewer logical contradictions.\n- Graph-based checkpointing permits automated recovery from tool exceptions."},
            {"title": "7. Comparative Analysis", "order": 7, "content": "Message-bus architectures (AutoGen) excel in open-ended creative dialogues, whereas graph-based state machines (LangGraph) and SOP frameworks (MetaGPT) provide deterministic control, typed state guarantees, and predictable error-handling required for production systems."},
            {"title": "8. Technical Insights", "order": 8, "content": "The integration of programmatic verification loops into cyclic graphs prevents errors from cascading. Rather than appending error logs to prompt history, agents re-enter specialized research states with scoped claim queries."},
            {"title": "9. Limitations", "order": 9, "content": "- Token overhead increases linearly with agent team size.\n- Inter-agent coordination latency introduces response delays of 15-45 seconds.\n- Vulnerability to adversarial prompt injection via retrieved web snippets and untrusted PDF inputs."},
            {"title": "10. Research Gaps", "order": 10, "content": "- Standardized benchmark suites for long-horizon coordination across 5+ specialized agents.\n- Zero-cost semantic convergence evaluation methods.\n- Formal mathematical safety boundaries for recursive re-planning under adversarial conditions."},
            {"title": "11. Conclusion", "order": 11, "content": "Multi-agent systems represent the future of autonomous research and software engineering. Production viability hinges on typed state machines, rigorous citation verification loops, and human-in-the-loop checkpoints."},
            {"title": "12. References", "order": 12, "content": "[1] Wang et al. A Survey on LLM Autonomous Agents (2024)\n[2] Qian et al. Communicative Agents for Software Development (2024)\n[3] Wu et al. AutoGen Multi-Agent Conversation (2024)\n[4] Hong et al. MetaGPT Collaborative Framework (2024)\n[5] Chase et al. Stateful Orchestration in Graph-Based Workflows (2025)"},
        ]

        full_md = "\n\n".join([f"## {s['title']}\n\n{s['content']}" for s in sections])
        pdf_path = PDFReportGenerator.generate_pdf(
            report_id=project_id,
            title="Comprehensive Survey on Agentic AI & Cyclic Multi-Agent Architectures",
            executive_summary=sections[0]["content"],
            sections=sections,
            sources=sources_data,
            verification_passed=True,
        )

        report = Report(
            project_id=project_id,
            title="Comprehensive Survey on Agentic AI & Cyclic Multi-Agent Architectures",
            executive_summary=sections[0]["content"],
            markdown_content=full_md,
            pdf_path=pdf_path,
            sections=sections,
            citation_count=4,
            source_count=5,
            unsupported_claims_count=0,
            verification_passed=True,
        )
        db.add(report)

        db.add(UsageRecord(
            user_id=user.id,
            project_id=project_id,
            agent_name="Multi-Agent Swarm",
            model="gpt-4o",
            prompt_tokens=2200,
            completion_tokens=3100,
            total_tokens=5300,
            estimated_cost_usd=0.021,
        ))

        await db.commit()
        print("Demo research project seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed())

