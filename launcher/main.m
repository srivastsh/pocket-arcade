#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>

@interface GamesLauncher : NSObject <NSApplicationDelegate, WKNavigationDelegate, WKScriptMessageHandler, NSToolbarDelegate>
@property (strong) NSWindow *window;
@property (strong) WKWebView *webView;
@property (strong) NSURL *catalog;
@property BOOL focusSearch;
@property (strong) NSToolbar *gameToolbar;
@property (copy) NSArray<NSDictionary *> *actions;
@property (strong) NSView *sidebar;
@property (strong) NSStackView *categories;
@end

@implementation GamesLauncher
- (void)showGames:(id)sender {
    self.focusSearch = sender != nil;
    [self.webView loadFileURL:self.catalog allowingReadAccessToURL:self.catalog.URLByDeletingLastPathComponent];
    [self.window makeFirstResponder:self.webView];
}

- (void)goBack:(id)sender {
    if (self.webView.canGoBack) [self.webView goBack];
}

- (void)returnToCatalog:(id)sender {
    if ([self.webView.backForwardList.backItem.URL isEqual:self.catalog]) [self.webView goBack];
    else [self showGames:nil];
}

- (NSArray *)toolbarDefaultItemIdentifiers:(NSToolbar *)toolbar {
    return [@[@"Library", NSToolbarFlexibleSpaceItemIdentifier] arrayByAddingObjectsFromArray:[self.actions valueForKey:@"id"]];
}

- (NSArray *)toolbarAllowedItemIdentifiers:(NSToolbar *)toolbar {
    return [self toolbarDefaultItemIdentifiers:toolbar];
}

- (NSToolbarItem *)toolbar:(NSToolbar *)toolbar itemForItemIdentifier:(NSString *)identifier
 willBeInsertedIntoToolbar:(BOOL)inserted {
    NSToolbarItem *item = [[NSToolbarItem alloc] initWithItemIdentifier:identifier];
    if ([identifier isEqualToString:@"Library"]) {
        item.label = @"All Games";
        item.toolTip = @"Return to the game collection";
        item.image = [NSImage imageWithSystemSymbolName:@"chevron.backward" accessibilityDescription:@"All Games"];
        item.navigational = YES;
        item.target = self;
        item.action = @selector(returnToCatalog:);
    } else {
        item.target = self;
        item.action = @selector(performGameAction:);
        item.autovalidates = NO;
        item.bordered = YES;
        for (NSDictionary *action in self.actions) {
            if ([identifier isEqualToString:action[@"id"]]) [self configureItem:item fromAction:action];
        }
    }
    return item;
}

- (void)configureItem:(NSToolbarItem *)item fromAction:(NSDictionary *)action {
    item.label = action[@"title"];
    item.paletteLabel = action[@"title"];
    item.toolTip = action[@"title"];
    item.enabled = [action[@"enabled"] boolValue];
    if ([action[@"toggle"] boolValue]) {
        NSString *symbol = [action[@"pressed"] boolValue] ? @"flag.fill" : @"flag";
        item.image = [NSImage imageWithSystemSymbolName:symbol accessibilityDescription:action[@"title"]];
        if (@available(macOS 26.0, *)) item.style = [action[@"pressed"] boolValue] ? NSToolbarItemStyleProminent : NSToolbarItemStylePlain;
    }
}

- (void)performGameAction:(NSToolbarItem *)button {
    [self.window makeFirstResponder:self.webView];
    [self.webView callAsyncJavaScript:@"document.getElementById(id)?.click()"
                           arguments:@{@"id": button.itemIdentifier} inFrame:nil
                      inContentWorld:WKContentWorld.pageWorld completionHandler:nil];
}

- (void)selectCategory:(NSButton *)button {
    [self.window makeFirstResponder:self.webView];
    [self.webView callAsyncJavaScript:@"document.querySelector('#chips [data-f=' + id + ']').click()"
                           arguments:@{@"id": button.identifier} inFrame:nil
                      inContentWorld:WKContentWorld.pageWorld completionHandler:nil];
}

- (void)installGlassSidebarInView:(NSView *)root API_AVAILABLE(macos(26.0)) {
    NSGlassEffectView *glass = [[NSGlassEffectView alloc] init];
    glass.style = NSGlassEffectViewStyleRegular;
    glass.cornerRadius = 24;
    glass.translatesAutoresizingMaskIntoConstraints = NO;
    glass.hidden = YES;
    [root addSubview:glass];
    [NSLayoutConstraint activateConstraints:@[
        [glass.leadingAnchor constraintEqualToAnchor:root.leadingAnchor constant:14],
        [glass.topAnchor constraintEqualToAnchor:root.topAnchor constant:14],
        [glass.bottomAnchor constraintEqualToAnchor:root.bottomAnchor constant:-14],
        [glass.widthAnchor constraintEqualToConstant:184]
    ]];
    NSView *content = [[NSView alloc] init];
    glass.contentView = content;
    NSImageView *icon = [NSImageView imageViewWithImage:NSApp.applicationIconImage];
    [icon.widthAnchor constraintEqualToConstant:34].active = YES;
    [icon.heightAnchor constraintEqualToConstant:34].active = YES;
    NSTextField *title = [NSTextField labelWithString:@"Pocket Arcade"];
    title.font = [NSFont systemFontOfSize:16 weight:NSFontWeightSemibold];
    NSStackView *brand = [NSStackView stackViewWithViews:@[icon, title]];
    brand.spacing = 7;
    self.categories = [NSStackView stackViewWithViews:@[]];
    self.categories.orientation = NSUserInterfaceLayoutOrientationVertical;
    self.categories.spacing = 3;
    brand.translatesAutoresizingMaskIntoConstraints = NO;
    self.categories.translatesAutoresizingMaskIntoConstraints = NO;
    [content addSubview:brand];
    [content addSubview:self.categories];
    [NSLayoutConstraint activateConstraints:@[
        [brand.leadingAnchor constraintEqualToAnchor:content.leadingAnchor constant:16],
        [brand.topAnchor constraintEqualToAnchor:content.topAnchor constant:17],
        [self.categories.topAnchor constraintEqualToAnchor:brand.bottomAnchor constant:20],
        [self.categories.leadingAnchor constraintEqualToAnchor:content.leadingAnchor constant:10],
        [self.categories.trailingAnchor constraintEqualToAnchor:content.trailingAnchor constant:-10]
    ]];
    self.sidebar = glass;
}

- (void)updateCategories:(NSArray *)categories {
    NSDictionary *symbols = @{@"all":@"square.grid.2x2", @"recent":@"clock", @"arcade":@"gamecontroller",
                              @"puzzle":@"puzzlepiece", @"cards":@"suit.club", @"board":@"checkerboard.rectangle",
                              @"skill":@"textformat"};
    for (NSView *view in self.categories.arrangedSubviews.copy) [view removeFromSuperview];
    for (NSDictionary *category in categories) {
        NSString *key = category[@"id"];
        NSImage *image = [NSImage imageWithSystemSymbolName:symbols[key] accessibilityDescription:nil];
        NSButton *button = [NSButton buttonWithTitle:category[@"title"] image:image
                                              target:self action:@selector(selectCategory:)];
        button.identifier = key;
        button.bordered = NO;
        button.imagePosition = NSImageLeading;
        button.alignment = NSTextAlignmentLeft;
        button.font = [NSFont systemFontOfSize:13 weight:NSFontWeightMedium];
        BOOL selected = [category[@"selected"] boolValue];
        button.contentTintColor = selected ? NSColor.controlAccentColor : NSColor.labelColor;
        button.wantsLayer = YES;
        button.layer.cornerRadius = 10;
        button.layer.backgroundColor = selected ? [NSColor.controlAccentColor colorWithAlphaComponent:0.17].CGColor : NULL;
        [button setAccessibilityValue:@(selected)];
        NSView *previous = self.categories.arrangedSubviews.lastObject;
        if (previous && [key isEqualToString:@"arcade"]) [self.categories setCustomSpacing:16 afterView:previous];
        [self.categories addArrangedSubview:button];
        [button.widthAnchor constraintEqualToAnchor:self.categories.widthAnchor].active = YES;
        [button.heightAnchor constraintEqualToConstant:32].active = YES;
    }
}

- (void)userContentController:(WKUserContentController *)controller didReceiveScriptMessage:(WKScriptMessage *)message {
    if (!message.frameInfo.isMainFrame || !message.frameInfo.request.URL.isFileURL) return;
    NSDictionary *page = message.body;
    self.window.title = page[@"title"];
    self.sidebar.hidden = ![page[@"sidebar"] boolValue];
    if ([page[@"sidebar"] boolValue]) [self updateCategories:page[@"categories"]];
    if (![page[@"game"] boolValue]) {
        self.window.toolbar = nil;
        return;
    }
    self.actions = page[@"actions"];
    NSString *toolbarID = [@"GameToolbar." stringByAppendingString:page[@"title"]];
    if (![self.window.toolbar.identifier isEqualToString:toolbarID]) {
        self.gameToolbar = [[NSToolbar alloc] initWithIdentifier:toolbarID];
        self.gameToolbar.delegate = self;
        self.gameToolbar.displayMode = NSToolbarDisplayModeIconOnly;
        self.window.toolbar = self.gameToolbar;
    } else {
        for (NSToolbarItem *item in self.gameToolbar.items) {
            for (NSDictionary *action in self.actions) {
                if ([item.itemIdentifier isEqualToString:action[@"id"]]) [self configureItem:item fromAction:action];
            }
        }
    }
}

- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
    if (self.focusSearch && [webView.URL isEqual:self.catalog]) {
        [webView evaluateJavaScript:@"showAllGames()" completionHandler:nil];
    }
    self.focusSearch = NO;
}

- (NSMenu *)menuNamed:(NSString *)name inBar:(NSMenu *)bar {
    NSMenuItem *item = [[NSMenuItem alloc] init];
    NSMenu *menu = [[NSMenu alloc] initWithTitle:name];
    [bar addItem:item];
    item.submenu = menu;
    return menu;
}

- (void)applicationDidFinishLaunching:(NSNotification *)notification {
    NSMenu *bar = [[NSMenu alloc] init];
    NSMenu *app = [self menuNamed:@"Pocket Arcade" inBar:bar];
    [app addItemWithTitle:@"About Pocket Arcade" action:@selector(orderFrontStandardAboutPanel:) keyEquivalent:@""];
    [app addItem:[NSMenuItem separatorItem]];
    [app addItemWithTitle:@"Hide Pocket Arcade" action:@selector(hide:) keyEquivalent:@"h"];
    [app addItemWithTitle:@"Quit Pocket Arcade" action:@selector(terminate:) keyEquivalent:@"q"];
    NSMenu *play = [self menuNamed:@"Game" inBar:bar];
    [play addItemWithTitle:@"Show All Games" action:@selector(showGames:) keyEquivalent:@"l"].target = self;
    [play addItemWithTitle:@"Back" action:@selector(goBack:) keyEquivalent:@"["].target = self;
    NSMenu *edit = [self menuNamed:@"Edit" inBar:bar];
    [edit addItemWithTitle:@"Cut" action:@selector(cut:) keyEquivalent:@"x"];
    [edit addItemWithTitle:@"Copy" action:@selector(copy:) keyEquivalent:@"c"];
    [edit addItemWithTitle:@"Paste" action:@selector(paste:) keyEquivalent:@"v"];
    [edit addItemWithTitle:@"Select All" action:@selector(selectAll:) keyEquivalent:@"a"];
    NSMenu *windowMenu = [self menuNamed:@"Window" inBar:bar];
    [windowMenu addItemWithTitle:@"Minimize" action:@selector(performMiniaturize:) keyEquivalent:@"m"];
    [windowMenu addItemWithTitle:@"Close" action:@selector(performClose:) keyEquivalent:@"w"];
    NSApp.mainMenu = bar;
    NSApp.windowsMenu = windowMenu;

    self.catalog = [NSBundle.mainBundle URLForResource:@"index" withExtension:@"html" subdirectory:@"Games"];
    NSWindowStyleMask style = NSWindowStyleMaskTitled | NSWindowStyleMaskClosable |
                              NSWindowStyleMaskMiniaturizable | NSWindowStyleMaskResizable;
    self.window = [[NSWindow alloc] initWithContentRect:NSMakeRect(0, 0, 960, 760)
                                              styleMask:style backing:NSBackingStoreBuffered defer:NO];
    self.window.title = @"Pocket Arcade";
    self.window.toolbarStyle = NSWindowToolbarStyleUnified;
    self.window.contentMinSize = NSMakeSize(380, 420);
    [self.window center];
    [self.window setFrameAutosaveName:@"GamesWindow"];
    WKWebViewConfiguration *configuration = [[WKWebViewConfiguration alloc] init];
    NSURL *bridgeURL = [NSBundle.mainBundle URLForResource:@"toolbar" withExtension:@"js"];
    NSString *bridge = [NSString stringWithContentsOfURL:bridgeURL encoding:NSUTF8StringEncoding error:NULL];
    if (@available(macOS 26.0, *)) bridge = [@"window.nativeGlassSidebar=true;\n" stringByAppendingString:bridge];
    WKUserScript *script = [[WKUserScript alloc] initWithSource:bridge injectionTime:WKUserScriptInjectionTimeAtDocumentEnd
                                              forMainFrameOnly:YES];
    [configuration.userContentController addScriptMessageHandler:self name:@"gameToolbar"];
    [configuration.userContentController addUserScript:script];
    self.webView = [[WKWebView alloc] initWithFrame:self.window.contentView.bounds configuration:configuration];
    self.webView.navigationDelegate = self;
    self.webView.allowsBackForwardNavigationGestures = YES;
    NSView *root = self.window.contentView;
    self.webView.autoresizingMask = NSViewWidthSizable | NSViewHeightSizable;
    [root addSubview:self.webView];
    if (@available(macOS 26.0, *)) [self installGlassSidebarInView:root];
    [self showGames:nil];
    [self.window makeKeyAndOrderFront:nil];
    [NSApp activateIgnoringOtherApps:YES];
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)sender {
    return YES;
}
@end

int main(void) {
    @autoreleasepool {
        NSApplication *application = NSApplication.sharedApplication;
        GamesLauncher *launcher = [[GamesLauncher alloc] init];
        application.delegate = launcher;
        [application setActivationPolicy:NSApplicationActivationPolicyRegular];
        [application run];
        (void)launcher.window;
    }
    return 0;
}
