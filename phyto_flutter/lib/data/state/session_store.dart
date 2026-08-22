import 'package:flutter_riverpod/flutter_riverpod.dart';

class SessionState {
  const SessionState({this.token, this.role});

  final String? token;
  final String? role;

  bool get isAuthed => token != null && token!.isNotEmpty;
}

class SessionNotifier extends Notifier<SessionState> {
  @override
  SessionState build() => const SessionState();

  void setSession({required String token, required String role}) {
    state = SessionState(token: token, role: role);
  }

  void clear() {
    state = const SessionState();
  }
}

final sessionProvider = NotifierProvider<SessionNotifier, SessionState>(SessionNotifier.new);

