"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wouter_1 = require("wouter");
const react_query_1 = require("@tanstack/react-query");
const toaster_1 = require("@/components/ui/toaster");
const tooltip_1 = require("@/components/ui/tooltip");
const not_found_1 = __importDefault(require("@/pages/not-found"));
const dashboard_1 = __importDefault(require("@/pages/dashboard"));
const jobs_1 = __importDefault(require("@/pages/jobs"));
const job_detail_1 = __importDefault(require("@/pages/job-detail"));
const webhooks_1 = __importDefault(require("@/pages/webhooks"));
const system_1 = __importDefault(require("@/pages/system"));
const layout_1 = require("@/components/layout");
const queryClient = new react_query_1.QueryClient();
function Router() {
    return (<layout_1.Layout>
      <wouter_1.Switch>
        <wouter_1.Route path="/" component={dashboard_1.default}/>
        <wouter_1.Route path="/jobs" component={jobs_1.default}/>
        <wouter_1.Route path="/jobs/:id" component={job_detail_1.default}/>
        <wouter_1.Route path="/webhooks" component={webhooks_1.default}/>
        <wouter_1.Route path="/system" component={system_1.default}/>
        <wouter_1.Route component={not_found_1.default}/>
      </wouter_1.Switch>
    </layout_1.Layout>);
}
function App() {
    return (<react_query_1.QueryClientProvider client={queryClient}>
      <tooltip_1.TooltipProvider>
        <wouter_1.Router base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </wouter_1.Router>
        <toaster_1.Toaster />
      </tooltip_1.TooltipProvider>
    </react_query_1.QueryClientProvider>);
}
exports.default = App;
