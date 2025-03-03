//
//  FlashcardView.swift
//  flashcards-macos
//
//  Created by Matt Linder on 3/3/25.
//

import SwiftUI

struct FlashcardView: View {
    let card: Flashcard
    
    var body: some View {
        VStack {
            Text(card.front)
                .padding()
                .multilineTextAlignment(.center)
            Divider()
            Text(card.back)
                .padding()
                .multilineTextAlignment(.center)
        }
    }
}
