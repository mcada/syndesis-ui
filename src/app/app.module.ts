import {NgModule, ApplicationRef, APP_INITIALIZER} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {HttpModule, JsonpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {removeNgStyles, createNewHosts} from '@angularclass/hmr';

/*
 * Platform and Environment providers/directives/pipes
 */
import {ENV_PROVIDERS} from './environment';
import {ROUTES} from './app.routes';
// App is our top level component
import {App} from './app.component';
import {APP_RESOLVER_PROVIDERS} from './app.resolver';

// Angular Modules
import {Admin} from './admin';
import {AppState} from './app.service';
import {LogConfig} from './log.service';
import {Logger} from './log.service';
import {Forge} from './forge.service';
import {Kubernetes} from './kubernetes.service';
import {Dashboard} from './dashboard';
import {Home} from './home';
import {NoContent} from './no-content';
import {XLarge} from './home/x-large';

// Third-Party Imports
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

//exports.c3 = require('c3');
//
// Application wide providers
const APP_PROVIDERS = [
    ...APP_RESOLVER_PROVIDERS,
    AppState,
    LogConfig,
    Forge,
    Kubernetes
];

// Logger instance
var log = Logger.get("AppModule");

/**
 * `AppModule` is the main entry point into Angular2's bootstrapping process
 */
@NgModule({
    bootstrap: [App],
    declarations: [
        Admin,
        App,
        Dashboard,
        Home,
        NoContent,
        XLarge
    ],
    imports: [ // import Angular's modules
        BrowserModule,
        FormsModule,
        HttpModule,
        NgbModule,
        RouterModule.forRoot(ROUTES, {useHash: true})
    ],
    providers: [ // expose our Services and Providers into Angular's dependency injection
        ENV_PROVIDERS,
        APP_PROVIDERS,
        { 
          provide: APP_INITIALIZER,
          useFactory: (appState:AppState) => () => appState.load(appState),
          deps: [AppState],
          multi: true
        }
    ]
})
export class AppModule {

    constructor(public appRef: ApplicationRef, public appState: AppState, public logConfig:LogConfig) {
      log.debug("App module created");
    }

    hmrOnInit(store) {
        if (!store || !store.state) return;
        console.log('HMR store', store);
        this.appState._state = store.state;
        this.appRef.tick();
        delete store.state;
    }
    
    hmrOnDestroy(store) {
        const cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
        // recreate elements
        const state = this.appState._state;
        store.state = state;
        store.disposeOldHosts = createNewHosts(cmpLocation);
        // remove styles
        removeNgStyles();
    }
    
    hmrAfterDestroy(store) {
        // display new elements
        store.disposeOldHosts();
        delete store.disposeOldHosts;
    }
}