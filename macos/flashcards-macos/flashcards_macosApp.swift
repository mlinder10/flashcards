//
//  flashcards_macosApp.swift
//  flashcards-macos
//
//  Created by Matt Linder on 3/2/25.
//

import SwiftUI

@main
struct flashcards_macosApp: App {
    @StateObject private var cStore = CardStore()
    
    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(cStore)
        }
    }
}

struct RootView: View {
    var body: some View {
        TabView {
            SavedPage()
                .tabItem { Text("Saved") }
            GeneratePage()
                .tabItem { Text("Create") }
        }
    }
}
