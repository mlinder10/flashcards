//
//  Flashcard.swift
//  flashcards-macos
//
//  Created by Matt Linder on 3/2/25.
//

import Foundation

struct Flashcard: Identifiable, Codable {
    let id: String
    let front: String
    let back: String
    
    enum CodingKeys: String, CodingKey {
        case id, front, back
    }
    
    init(id: String? = nil, front: String, back: String) {
        self.id = id ?? UUID().uuidString // Use a new UUID if no id is provided
        self.front = front
        self.back = back
    }
    
    // Custom init to handle missing "id" field in the JSON
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decodeIfPresent(String.self, forKey: .id) ?? UUID().uuidString
        self.front = try container.decode(String.self, forKey: .front)
        self.back = try container.decode(String.self, forKey: .back)
    }
}


extension Array<Flashcard> {
    func toCsv() -> String {
        return self
            .map({ "\($0.front);\($0.back)" })
            .joined(separator: "\n")
    }
}
