//
//  NetworkManager.swift
//  CapstoneProject
//
//  Created by Matt Linder on 9/1/24.
//

import Foundation

fileprivate struct GeminiRequestBody: Codable {
    let contents: [Part]
    
    init(_ prompt: String) {
        self.contents = [Part(parts: [Text(text: prompt)])]
    }
    
    init(_ prompts: [String]) {
        self.contents = [Part(parts: prompts.map({ Text(text: $0) }))]
    }
    
    struct Part: Codable {
        let parts: [Text]
    }
    struct Text: Codable {
        let text: String
    }
}

fileprivate struct GeminiResponseBody: Codable {
    let candidates: [Candidate]
    let usageMetadata: UsageMetadata
    let modelVersion: String
    
    func toString() -> String {
        return stripMarkdown(candidates.first?.content.parts.first?.text ?? "")
    }
    
    private func stripMarkdown(_ str: String) -> String {
        return str.replacingOccurrences(of: "```json", with: "").replacingOccurrences(of: "```", with: "")
    }
    
    struct Candidate: Codable {
        let content: Content
        let finishReason: String
        let avgLogprobs: Double
    }
    
    struct Content: Codable {
        let parts: [Part]
        let role: String
    }
    
    struct Part: Codable {
        let text: String
    }
    
    struct UsageMetadata: Codable {
        let promptTokenCount: Int
        let candidatesTokenCount: Int
        let totalTokenCount: Int
        let promptTokensDetails: [TokenDetail]
        let candidatesTokensDetails: [TokenDetail]
    }
    
    struct TokenDetail: Codable {
        let modality: String
        let tokenCount: Int
    }
}

let SYLLABUS_PROMPT = """
    I'm going to send you a course syllabus.
    I'd like you to generate flashcards to teach the course material.
    Please respond in the following json format: [{ front: string, back: string }].
    Your response string should not include any markdown formatting.
    Please be sure to generate flashcards related to the course content, not the course syllabus.
    You will need to use external resources and hypothesize the specifics of the course.
    
    Course Syllabus:
        
"""

let COURSE_INFO_PROMPT = """
    I'm going to give you some information about a course.
    I'd like you to generate flashcards to teach the course material.
    Please respond in the following json format: [{ front: string, back: string }].
    Your response string should not include any markdown formatting.
    Please be sure to generate flashcards related to the course content, not the course information.
    Please do not repeat yourself or generate any additional text. Only one JSON array of flashcard objects.
    You will need to use external resources and hypothesize the specifics of the course.
    University: University of South Carolina,
    Department: Psychology,
    Course Number: PSYC 420,
    Course Name: Survey of Developmental Psychology
"""

enum GeminiError: Error {
    case badData
}

final class GeminiManager {
    static let shared = GeminiManager()
    
    private let SERVER_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
    private let API_KEY = "AIzaSyAjnhfeIZ8e4_77W1yN3pfA8pPgFeMujhQ"
    private let HEADERS = [
        "Content-Type": "application/json",
    ]
    
    private let client: HttpClient
    
    private init() {
        self.client = HttpClient()
        self.client.config(baseUrl: SERVER_URL, headers: HEADERS)
    }
    
    func generate(prompt: String) async throws -> [Flashcard] {
        let body = GeminiRequestBody(SYLLABUS_PROMPT + prompt)
        let jsonData = try JSONEncoder().encode(body)
        let response: GeminiResponseBody = try await client.request(
            method: .post,
            route: "?key=\(API_KEY)",
            body: jsonData
        )
        
        guard let data = response.toString().data(using: .utf8) else { throw GeminiError.badData }
        return try JSONDecoder().decode([Flashcard].self, from: data)
    }
}
