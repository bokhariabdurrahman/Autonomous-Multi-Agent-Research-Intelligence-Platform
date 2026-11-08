"""Academic search tools integrating arXiv, Semantic Scholar, and Crossref APIs."""

import re
import urllib.parse
import xml.etree.ElementTree as ET
from typing import Any, Dict, List, Optional
import httpx
from app.core.config import settings
from app.monitoring.logger import logger


class AcademicSearchTool:
    """Retrieves academic papers and scholarly metadata from arXiv, Semantic Scholar, and Crossref."""

    def __init__(self):
        self.semantic_scholar_api_key = settings.SEMANTIC_SCHOLAR_API_KEY
        self.crossref_mailto = settings.CROSSREF_MAILTO

    async def search_all(self, query: str, max_per_source: int = 3) -> List[Dict[str, Any]]:
        """Search across arXiv, Semantic Scholar, and Crossref, returning combined deduplicated papers."""
        papers: List[Dict[str, Any]] = []

        # 1. Query arXiv
        try:
            arxiv_papers = await self.search_arxiv(query, max_results=max_per_source)
            papers.extend(arxiv_papers)
        except Exception as e:
            logger.warning(f"arXiv search failed: {e}")

        # 2. Query Semantic Scholar
        try:
            s2_papers = await self.search_semantic_scholar(query, max_results=max_per_source)
            papers.extend(s2_papers)
        except Exception as e:
            logger.warning(f"Semantic Scholar search failed: {e}")

        # 3. Query Crossref
        try:
            crossref_papers = await self.search_crossref(query, max_results=max_per_source)
            papers.extend(crossref_papers)
        except Exception as e:
            logger.warning(f"Crossref search failed: {e}")

        # Deduplicate papers by normalized title
        seen_titles = set()
        deduped = []
        for p in papers:
            norm_title = re.sub(r"[^a-zA-Z0-9]", "", p.get("title", "").lower())
            if norm_title and norm_title not in seen_titles:
                seen_titles.add(norm_title)
                deduped.append(p)

        return deduped

    async def search_arxiv(self, query: str, max_results: int = 4) -> List[Dict[str, Any]]:
        """Query official arXiv API via atom XML endpoint."""
        url = (
            f"https://export.arxiv.org/api/query?search_query=all:{urllib.parse.quote(query)}"
            f"&start=0&max_results={max_results}&sortBy=relevance&sortOrder=descending"
        )
        async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                logger.warning(f"arXiv returned status code {resp.status_code}")
                return []

            root = ET.fromstring(resp.text)
            ns = {"atom": "http://www.w3.org/2005/Atom"}
            results = []

            for entry in root.findall("atom:entry", ns):
                title_elem = entry.find("atom:title", ns)
                summary_elem = entry.find("atom:summary", ns)
                published_elem = entry.find("atom:published", ns)
                id_elem = entry.find("atom:id", ns)

                title = title_elem.text.strip().replace("\n", " ") if title_elem is not None and title_elem.text else "Untitled arXiv Paper"
                summary = summary_elem.text.strip().replace("\n", " ") if summary_elem is not None and summary_elem.text else ""
                published = published_elem.text[:10] if published_elem is not None and published_elem.text else "2024"
                paper_url = id_elem.text.strip() if id_elem is not None and id_elem.text else None

                authors = []
                for author in entry.findall("atom:author", ns):
                    name_elem = author.find("atom:name", ns)
                    if name_elem is not None and name_elem.text:
                        authors.append(name_elem.text.strip())

                results.append({
                    "title": title,
                    "url": paper_url,
                    "snippet": summary[:800],
                    "authors": authors[:5],
                    "publication_date": published,
                    "source_type": "arxiv",
                    "reliability_score": 0.95,
                    "relevance_score": 0.90,
                })
            return results

    async def search_semantic_scholar(self, query: str, max_results: int = 4) -> List[Dict[str, Any]]:
        """Query Semantic Scholar Graph API."""
        url = "https://api.semanticscholar.org/graph/v1/paper/search"
        headers = {}
        if self.semantic_scholar_api_key:
            headers["x-api-key"] = self.semantic_scholar_api_key

        params = {
            "query": query,
            "limit": max_results,
            "fields": "title,authors,year,abstract,url,venue",
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            if resp.status_code != 200:
                logger.warning(f"Semantic Scholar API status {resp.status_code}")
                return []

            data = resp.json()
            results = []
            for item in data.get("data", []):
                title = item.get("title") or "Untitled Paper"
                abstract = item.get("abstract") or "No abstract provided."
                year = str(item.get("year")) if item.get("year") else "2024"
                url = item.get("url") or (f"https://www.semanticscholar.org/paper/{item.get('paperId')}" if item.get("paperId") else None)
                authors = [a.get("name") for a in item.get("authors", []) if a.get("name")]

                results.append({
                    "title": title,
                    "url": url,
                    "snippet": abstract[:800],
                    "authors": authors[:5],
                    "publication_date": year,
                    "source_type": "semantic_scholar",
                    "reliability_score": 0.94,
                    "relevance_score": 0.88,
                })
            return results

    async def search_crossref(self, query: str, max_results: int = 4) -> List[Dict[str, Any]]:
        """Query Crossref Works API."""
        url = "https://api.crossref.org/works"
        headers = {"User-Agent": f"NEXUS-AI/1.0 (mailto:{self.crossref_mailto})"}
        params = {
            "query.bibliographic": query,
            "rows": max_results,
            "select": "title,author,URL,published,abstract,DOI",
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            if resp.status_code != 200:
                logger.warning(f"Crossref API returned status {resp.status_code}")
                return []

            data = resp.json()
            results = []
            items = data.get("message", {}).get("items", [])
            for item in items:
                title_list = item.get("title", [])
                title = title_list[0] if title_list else "Crossref Publication"
                url = item.get("URL") or (f"https://doi.org/{item.get('DOI')}" if item.get("DOI") else None)
                abstract = item.get("abstract", "")
                if abstract and "<jats:p>" in abstract:
                    abstract = re.sub(r"<[^>]+>", "", abstract)
                snippet = abstract[:800] if abstract else f"Scholarly publication indexed under DOI {item.get('DOI', '')}"

                authors = []
                for auth in item.get("author", []):
                    given = auth.get("given", "")
                    family = auth.get("family", "")
                    full = f"{given} {family}".strip()
                    if full:
                        authors.append(full)

                pub_parts = item.get("published", {}).get("date-parts", [[]])
                pub_year = str(pub_parts[0][0]) if pub_parts and pub_parts[0] else "2024"

                results.append({
                    "title": title,
                    "url": url,
                    "snippet": snippet,
                    "authors": authors[:5],
                    "publication_date": pub_year,
                    "source_type": "crossref",
                    "reliability_score": 0.92,
                    "relevance_score": 0.85,
                })
            return results

