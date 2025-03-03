//
//  LocalModelManager.swift
//  flashcards-macos
//
//  Created by Matt Linder on 3/3/25.
//

import Foundation

enum LocalModelError: Error {
    case badData
}

fileprivate struct LocalModelRequestBody: Encodable {
    let prompts: [String]
    let tokenLimit: Int
}

fileprivate struct LocalModelResponseBody: Decodable {
    let response: String
}

enum ResponseSize: Int, CaseIterable, Identifiable {
    var id: Int { self.rawValue }
    
    case small = 128
    case medium = 256
    case large = 1024
    
    var label: String {
        switch self {
        case .small: "Small"
        case .medium: "Medium"
        case .large: "Large"
        }
    }
}

final class LocalModelManager {
    static let shared = LocalModelManager()
    
    private let SERVER_URL = "http://127.0.0.1:5000"
    private let HEADERS = [
        "Content-Type": "application/json",
    ]
    
    private let client: HttpClient
    
    private init() {
        self.client = HttpClient()
        self.client.config(baseUrl: SERVER_URL, headers: HEADERS)
    }
    
    func generate(prompt: String, tokenLimit: ResponseSize = .small) async throws -> [Flashcard] {
        let body = LocalModelRequestBody(prompts: [prompt], tokenLimit: tokenLimit.rawValue)
        let jsonData = try JSONEncoder().encode(body)
        let response: LocalModelResponseBody = try await client.request(
            method: .post,
            route: "",
            body: jsonData
        )
        return try processResponse(response.response)
    }
    
    private func processResponse(_ response: String) throws -> [Flashcard] {
        let startIndex = response.firstIndex(of: "[")
        let endOfArrayIndex = response.firstIndex(of: "]")
        let endOfLastCardIndex = response.lastIndex(of: "}")
        let endIndex = endOfArrayIndex ?? endOfLastCardIndex!
        let jsonString = String(response[startIndex!..<endIndex]) + (endIndex == endOfArrayIndex ? "]" : "}]")
        guard let data = jsonString.data(using: .utf8) else { throw LocalModelError.badData }
        return try JSONDecoder().decode([Flashcard].self, from: data)
    }
}

func buildPrompt(university: String, department: String, courseNumber: String, courseName: String) -> String {
    return (
        """
            I'm going to give you some information about a course.
            I'd like you to generate flashcards to teach the course material.
            Please respond in the following json format: [{ front: string, back: string }].
            Your response string should not include any markdown formatting.
            Please be sure to generate flashcards related to the course content, not the course information.
            Please do not repeat yourself or generate any additional text. Only one JSON array of flashcard objects.
            You will need to use external resources and hypothesize the specifics of the course.
            University: \(university),
            Department: \(department),
            Course Number: \(courseNumber),
            Course Name: \(courseName)
        """
    )
}
